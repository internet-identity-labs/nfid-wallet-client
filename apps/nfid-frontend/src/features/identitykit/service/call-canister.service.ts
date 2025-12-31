import {
  Agent,
  blsVerify,
  CallRequest,
  Cbor,
  Certificate,
  lookupResultToBuffer,
  UpdateCallRejectedError,
  v2ResponseBody,
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
function toArrayBuffer(buffer: any): ArrayBuffer {
  if (buffer instanceof Uint8Array) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer
  }
  if (buffer instanceof ArrayBuffer) {
    return buffer
  }
  // RequestId is also a Uint8Array, handle it as such
  return (buffer as Uint8Array).buffer.slice(
    (buffer as Uint8Array).byteOffset,
    (buffer as Uint8Array).byteOffset + (buffer as Uint8Array).byteLength,
  ) as ArrayBuffer
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
      const status = new TextDecoder().decode(toArrayBuffer(statusBuffer))

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
          const rejectCode = new Uint8Array(toArrayBuffer(rejectCodeBuffer))[0]

          const rejectMessageBuffer = lookupResultToBuffer(
            certificate.lookup([...path, "reject_message"]),
          )
          if (!rejectMessageBuffer) {
            throw new AgentError("Reject message buffer not found")
          }
          const rejectMessage = new TextDecoder().decode(
            toArrayBuffer(rejectMessageBuffer),
          )

          const error_code_buf = lookupResultToBuffer(
            certificate.lookup([...path, "error_code"]),
          )
          const error_code = error_code_buf
            ? new TextDecoder().decode(toArrayBuffer(error_code_buf))
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
      const { reject_code, reject_message, error_code } =
        response.body as v2ResponseBody
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
