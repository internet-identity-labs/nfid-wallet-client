import { filter, fromEvent } from "rxjs"

import { NoActionError } from "../service/exception-handler.service"
import { icrc29GetStatusMethodService } from "../service/method/silent/icrc29-get-status-method.service"

export const RPC_BASE = { jsonrpc: "2.0" }

export interface RPCBase {
  origin: string
  jsonrpc: string
  id: string
}

export interface RPCMessage extends RPCBase {
  method: string
  params: any
}

interface RPCSuccessResponse extends RPCBase {
  result: any
}

interface RPCErrorResponse extends RPCBase {
  error: {
    code: number
    message: string
    data?: any
  }
}

export interface RPCRequest {
  origin: string
  rpcMessage: {
    id: string
    jsonrpc: string
    method: string
    params: any[]
  }
}

export type RPCResponse = RPCSuccessResponse | RPCErrorResponse

type ProcedureDetails = {
  data: RPCMessage
  origin: string
}

export type ProcedureCallEvent = {
  type: "ON_REQUEST"
  data: ProcedureDetails
}

const windowMessages = fromEvent<MessageEvent<RPCMessage>>(window, "message")

export const rpcMessages = windowMessages.pipe(
  filter((event) => event.data?.jsonrpc === "2.0"),
)

export const RPCReceiverV3 =
  () => (send: (event: ProcedureCallEvent) => void) => {
    console.log("subscribe")
    const subscription = rpcMessages.subscribe(async (message) => {
      console.debug("sendResponse RPCReceiverV3", {
        rpcMessage: message.data,
        origin: message.origin,
      })

      if (message?.data?.method === icrc29GetStatusMethodService.getMethod()) {
        try {
          const parent = window.opener || window.parent
          const response =
            await icrc29GetStatusMethodService.executeMethod(message)
          parent.postMessage(response, message.origin)
        } catch (error: unknown) {
          if (error instanceof NoActionError) {
            console.warn(
              "Connection Warning: Origin and source differ from those used when the connection was established.",
            )
          }
        } finally {
          return
        }
      }

      if (
        message?.data?.params?.derivationOrigin ||
        message?.data?.params?.icrc95DerivationOrigin
      ) {
        message.data.params.derivationOrigin =
          message.data.params.icrc95DerivationOrigin ??
          message.data.params.derivationOrigin
        delete message.data.params["icrc95DerivationOrigin"]
      }

      return send({
        type: "ON_REQUEST",
        data: { data: message?.data, origin: message.origin },
      })
    })
    return () => subscription.unsubscribe()
  }
