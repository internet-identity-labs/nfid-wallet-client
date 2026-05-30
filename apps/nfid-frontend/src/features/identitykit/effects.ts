import { GenericError } from "./service/exception-handler.service"
import { IdentityKitRPCMachineContext, RPCErrorResponse } from "./type"

export const prepareFailedResponseEffect = async (
  context: IdentityKitRPCMachineContext,
): Promise<RPCErrorResponse> => {
  if (!context.activeRequest) throw new Error("No active request")

  const response: RPCErrorResponse = {
    origin: context.activeRequest.origin,
    jsonrpc: context.activeRequest.data.jsonrpc,
    id: context.activeRequest.data.id,
    error: {
      code: 1001,
      message: "Unknown error",
    },
  }

  return response
}

export const prepareCancelResponseEffect = async (
  context: IdentityKitRPCMachineContext,
): Promise<RPCErrorResponse> => {
  if (!context.activeRequest) throw new Error("No active request")

  console.log("[icrc49-debug] prepareCancelResponseEffect", {
    method: context.activeRequest.data.method,
    id: context.activeRequest.data.id,
    origin: context.activeRequest.origin,
  })

  const response: RPCErrorResponse = {
    origin: context.activeRequest.origin,
    jsonrpc: context.activeRequest.data.jsonrpc,
    id: context.activeRequest.data.id,
    error: {
      code: 3001,
      message: "Action aborted",
    },
  }

  return response
}

export const sendResponseEffect = async (context: any, event: any) => {
  const request = context.activeRequest
  const parent = window.opener || window.parent

  // ── debug (icrc49 reject regression) ───────────────────────────────
  console.log("[icrc49-debug] sendResponseEffect ENTER", {
    method: request?.data?.method,
    id: request?.data?.id,
    targetOrigin: request?.origin,
    parentIsOpener: !!window.opener,
    parentIsSelf: parent === window,
    parentClosed: (parent as Window | null)?.closed,
    eventDataKeys:
      event?.data && typeof event.data === "object"
        ? Object.keys(event.data)
        : typeof event?.data,
    eventDataIsError: event?.data instanceof Error,
    eventDataIsGenericError: event?.data instanceof GenericError,
  })

  try {
    if (event.data instanceof Error || event.data instanceof GenericError) {
      const payload = {
        origin: context.activeRequest.origin,
        jsonrpc: context.activeRequest.data.jsonrpc,
        id: context.activeRequest.data.id,
        error: {
          code: 3001,
          message: event.data?.message ?? "Unknown error",
        },
      }
      console.log("[icrc49-debug] sendResponseEffect POST error", {
        targetOrigin: request.origin,
        responseId: payload.id,
        responseJsonrpc: payload.jsonrpc,
        responseError: payload.error,
      })
      parent.postMessage(payload, request.origin)
    } else {
      // Spell out the exact payload so we can compare against the dApp
      // signer's expectations (must have jsonrpc:"2.0" and matching id).
      const payload = event.data as
        | {
            jsonrpc?: string
            id?: string
            error?: unknown
            result?: unknown
          }
        | undefined
      console.log("[icrc49-debug] sendResponseEffect POST raw event.data", {
        targetOrigin: request.origin,
        responseId: payload?.id,
        responseJsonrpc: payload?.jsonrpc,
        hasError: payload && "error" in payload,
        hasResult: payload && "result" in payload,
        errorPayload: payload?.error,
        fullPayload: payload,
      })
      parent.postMessage(event.data, request.origin)
    }
    console.log("[icrc49-debug] sendResponseEffect POST OK")
  } catch (err) {
    console.error("[icrc49-debug] sendResponseEffect POST THREW", err)
    throw err
  }
}
