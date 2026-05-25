// @ts-nocheck - TypeScript types for @icp-sdk/core/agent are too strict for this use case
import {
  Agent,
  AgentError,
  blsVerify,
  CallRequest,
  Cbor,
  Certificate,
  defaultStrategy,
  LookupResult,
  lookupResultToBuffer,
  pollForResponse,
  RequestId,
  v4ResponseBody,
  v2ResponseBody,
  isV4ResponseBody,
} from "@icp-sdk/core/agent"
import { uint8FromBufLike } from "@icp-sdk/core/candid"
import { DelegationIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

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
    ) as ArrayBuffer
  }
  // RequestId is ArrayBuffer & {...}, so it's already an ArrayBuffer
  return buffer as ArrayBuffer
}

// Local shim: UpdateCallRejectedError removed from @icp-sdk/core, replaced by ErrorCode hierarchy
class UpdateCallRejectedError extends Error {
  constructor(
    _cid: Principal,
    _methodName: string,
    _requestId: RequestId,
    _response: unknown,
    _rejectCode: number,
    rejectMessage: string,
    _errorCode?: string,
  ) {
    super(rejectMessage)
    this.name = "UpdateCallRejectedError"
  }
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
        new Uint8Array(Buffer.from(request.parameters, "base64")),
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
    arg: Uint8Array,
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

    if (response.body && isV4ResponseBody(response.body)) {
      const cert = (response.body as v4ResponseBody).certificate
      certificate = await Certificate.create({
        certificate: uint8FromBufLike(cert),
        rootKey: agent.rootKey,
        principal: { canisterId: Principal.from(canisterId) },
        blsVerify,
      })
      const path = [new TextEncoder().encode("request_status"), requestId]

      const statusBuffer = lookupResultToBuffer(
        certificate.lookup_path([...path, "status"]) as LookupResult,
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
          const rejectCodeBuffer = lookupResultToBuffer(
            certificate.lookup_path([...path, "reject_code"]) as LookupResult,
          )
          if (!rejectCodeBuffer) {
            throw new AgentError("Reject code buffer not found")
          }
          const rejectCodeArrayBuffer = toArrayBuffer(rejectCodeBuffer)
          const rejectCode = new Uint8Array(rejectCodeArrayBuffer as any)[0]

          const rejectMessageBuffer = lookupResultToBuffer(
            certificate.lookup_path([
              ...path,
              "reject_message",
            ]) as LookupResult,
          )
          if (!rejectMessageBuffer) {
            throw new AgentError("Reject message buffer not found")
          }
          const rejectMessageArrayBuffer = toArrayBuffer(rejectMessageBuffer)

          const rejectMessage = new TextDecoder().decode(
            rejectMessageArrayBuffer as any,
          )

          const error_code_buf = lookupResultToBuffer(
            certificate.lookup_path([...path, "error_code"]) as LookupResult,
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
      const pollResult = await pollForResponse(agent, cid, requestId, {
        strategy: defaultStrategy(),
        blsVerify,
      })
      certificate = pollResult.certificate

      return {
        contentMap: requestDetails,
        certificate: pollResult.rawCertificate,
      }
    }

    return {
      contentMap: requestDetails,
      certificate: new Uint8Array(Cbor.encode((certificate as any).cert)),
    }
  }
}

export const callCanisterService = new CallCanisterService()
