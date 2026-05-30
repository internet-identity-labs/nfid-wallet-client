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
    console.log("[icrc49-debug] sendResponseEffect POST error", payload)
    parent.postMessage(payload, request.origin)
  } else {
    console.log("[icrc49-debug] sendResponseEffect POST raw event.data", {
      payload: event.data,
    })
    parent.postMessage(event.data, request.origin)
  }
}
