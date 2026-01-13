// @ts-nocheck - TypeScript types for @dfinity/agent are too strict for this use case
import {
  Agent,
  blsVerify,
  CallRequest,
  Cbor,
  Certificate,
  lookupResultToBuffer,
  RequestId,
  UpdateCallRejectedError,
  v3ResponseBody,
} from "@dfinity/agent"
import { AgentError } from "@dfinity/agent/lib/cjs/errors"
import {
  defaultStrategy,
  pollForResponse,
} from "@dfinity/agent/lib/cjs/polling"
import { bufFromBufLike } from "@dfinity/candid"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { GenericError } from "./exception-handler.service"
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

// Helper function to convert lookupResultToBuffer result to ArrayBuffer
// lookupResultToBuffer returns Uint8Array | RequestId, where RequestId is ArrayBuffer & {...}
function toArrayBuffer(buffer: Uint8Array | RequestId): ArrayBuffer {
  if (buffer instanceof Uint8Array) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    )
  }
  // RequestId is ArrayBuffer & {...}, so it's already an ArrayBuffer
  return buffer as ArrayBuffer
}

export interface CallCanisterRequest {
  delegation: DelegationIdentity
  canisterId: string
  calledMethodName: string
  parameters: string
  agent: Agent
}

export interface CallCanisterResponse {
  contentMap: string
  certificate: string
}

class CallCanisterService {
  public async call(
    request: CallCanisterRequest,
  ): Promise<CallCanisterResponse> {
    try {
      const response = await this.poll(
        request.canisterId,
        request.calledMethodName,
        request.agent,
        Buffer.from(request.parameters, "base64").buffer as ArrayBuffer,
      )
      const certificate: string = Buffer.from(response.certificate).toString(
        "base64",
      )
      const cborContentMap = Cbor.encode(response.contentMap)
      const contentMap: string = Buffer.from(cborContentMap).toString("base64")

      return {
        certificate,
        contentMap,
      }
    } catch (error) {
      console.error(error)
      throw new GenericError((error as Error).message)
    }
  }

  private async poll(
    canisterId: string,
    methodName: string,
    agent: Agent,
    arg: ArrayBuffer,
  ): Promise<{ certificate: Uint8Array; contentMap: CallRequest | undefined }> {
    const cid = Principal.from(canisterId)

    if (agent.rootKey == null)
      throw new AgentError("Agent root key not initialized before making call")

    const { requestId, response, requestDetails } = await agent.call(cid, {
      methodName,
      arg,
      effectiveCanisterId: cid,
    })

    let certificate: Certificate | undefined

    if (response.body && (response.body as v3ResponseBody).certificate) {
      const cert = (response.body as v3ResponseBody).certificate
      certificate = await Certificate.create({
        certificate: bufFromBufLike(cert),
        rootKey: agent.rootKey,
        canisterId: Principal.from(canisterId),
        blsVerify,
      })
      const path = [new TextEncoder().encode("request_status"), requestId]

      const statusBuffer = lookupResultToBuffer(
        certificate.lookup([...path, "status"]),
      )
      if (!statusBuffer) {
        throw new AgentError("Status buffer not found")
      }
      const statusArrayBuffer = toArrayBuffer(statusBuffer)
      const status = new TextDecoder().decode(statusArrayBuffer as any)

      switch (status) {
        case "replied":
          break
        case "rejected": {
          // Find rejection details in the certificate

          const rejectCodeBuffer = lookupResultToBuffer(
            certificate.lookup([...path, "reject_code"]),
          )
          if (!rejectCodeBuffer) {
            throw new AgentError("Reject code buffer not found")
          }
          const rejectCodeArrayBuffer = toArrayBuffer(rejectCodeBuffer)
          const rejectCode = new Uint8Array(rejectCodeArrayBuffer as any)[0]

          const rejectMessageBuffer = lookupResultToBuffer(
            certificate.lookup([...path, "reject_message"]),
          )
          if (!rejectMessageBuffer) {
            throw new AgentError("Reject message buffer not found")
          }
          const rejectMessageArrayBuffer = toArrayBuffer(rejectMessageBuffer)

          const rejectMessage = new TextDecoder().decode(
            rejectMessageArrayBuffer as any,
          )

          const error_code_buf = lookupResultToBuffer(
            certificate.lookup([...path, "error_code"]),
          )
          const error_code = error_code_buf
            ? (() => {
                const errorCodeArrayBuffer = toArrayBuffer(error_code_buf)
                return new TextDecoder().decode(errorCodeArrayBuffer as any)
              })()
            : undefined
          throw new UpdateCallRejectedError(
            cid,
            methodName,
            requestId,
            response,
            rejectCode,
            rejectMessage,
            error_code,
          )
        }
      }
    } else if (response.body && "reject_message" in response.body) {
      // handle v2 response errors by throwing an UpdateCallRejectedError object
      const { reject_code, reject_message, error_code } = response.body
      throw new UpdateCallRejectedError(
        cid,
        methodName,
        requestId,
        response,
        reject_code,
        reject_message,
        error_code,
      )
    }

    // Fall back to polling if we receive an Accepted response code
    if (response.status === 202) {
      const pollStrategy = defaultStrategy()
      // Contains the certificate and the reply from the boundary node
      const response = await pollForResponse(
        agent,
        cid,
        requestId,
        pollStrategy,
        undefined,
        blsVerify,
      )
      certificate = response.certificate
    }

    return {
      contentMap: requestDetails,
      certificate: new Uint8Array(Cbor.encode((certificate as any).cert)),
    }
  }
}

export const callCanisterService = new CallCanisterService()
