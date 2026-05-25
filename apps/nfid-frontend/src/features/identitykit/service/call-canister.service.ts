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
// @ts-ignore
import borc from "borc"

import { GenericError } from "./exception-handler.service"
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

function bigIntToUint8Array(n: bigint): Uint8Array {
  let hex = n.toString(16)
  if (hex.length % 2) hex = "0" + hex
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function encodeContentMap(contentMap: any): Uint8Array {
  const prepared: Record<string, any> = {}
  for (const [key, value] of Object.entries(contentMap)) {
    if (value === undefined) continue
    if (value && typeof value === "object" && "_isPrincipal" in value) {
      prepared[key] = Buffer.from((value as any).toUint8Array())
    } else if (
      typeof value === "bigint" ||
      (value && typeof value === "object" && "_isExpiry" in value)
    ) {
      const bigVal =
        typeof value === "bigint" ? value : (value as any).toBigInt()
      prepared[key] = new borc.Tagged(
        2,
        Buffer.from(bigIntToUint8Array(bigVal)),
      )
    } else if (value instanceof Uint8Array) {
      prepared[key] = Buffer.from(value)
    } else {
      prepared[key] = value
    }
  }
  return new Uint8Array(borc.encode(new borc.Tagged(55799, prepared)))
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
      const cborContentMap = encodeContentMap(response.contentMap)
      const contentMap: string = Buffer.from(cborContentMap).toString("base64")

      // Debug: dump raw submit fields + contentMap keys
      try {
        const cm = response.contentMap as any
        const debug = {
          timestamp: new Date().toISOString(),
          canister_id: request.canisterId,
          method_name: request.calledMethodName,
          submit_keys: cm ? Object.keys(cm) : "null",
          submit_request_type: cm?.request_type,
          submit_sender_principal: cm?.sender?.toText?.() || "no toText",
          submit_sender_isPrincipal: cm?.sender?._isPrincipal,
          submit_expiry_isExpiry: cm?.ingress_expiry?._isExpiry,
          submit_expiry_value: cm?.ingress_expiry?.toBigInt?.()?.toString(),
          submit_arg_type: cm?.arg?.constructor?.name,
          submit_arg_length: cm?.arg?.length || cm?.arg?.byteLength,
          submit_nonce_type: cm?.nonce?.constructor?.name,
          submit_nonce_length: cm?.nonce?.length || cm?.nonce?.byteLength,
          contentMap_b64_length: contentMap.length,
          certificate_b64_length: certificate.length,
          certificate_first_bytes: Buffer.from(
            response.certificate.slice(0, 20),
          ).toString("hex"),
        }
        localStorage.setItem("__rpc_debug__", JSON.stringify(debug, null, 2))
      } catch (e: any) {
        localStorage.setItem("__rpc_debug_error__", String(e))
      }

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
    let rawCertificate: Uint8Array | undefined

    if (response.body && isV4ResponseBody(response.body)) {
      const cert = (response.body as v4ResponseBody).certificate
      rawCertificate = uint8FromBufLike(cert)
      certificate = await Certificate.create({
        certificate: rawCertificate,
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
      certificate: rawCertificate!,
    }
  }
}

export const callCanisterService = new CallCanisterService()
