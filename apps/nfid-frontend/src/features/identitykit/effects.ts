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
  const payload = event?.output ?? event?.data

  if (payload instanceof Error || payload instanceof GenericError) {
    parent.postMessage(
      {
        origin: context.activeRequest.origin,
        jsonrpc: context.activeRequest.data.jsonrpc,
        id: context.activeRequest.data.id,
        error: {
          code: 3001,
          message: payload?.message ?? "Unknown error",
        },
      },
      request.origin,
    )
  } else {
    parent.postMessage(payload, request.origin)
  }
}
