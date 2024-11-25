import { filter, fromEvent } from "rxjs"

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
  filter((event) => event.data && event.data.jsonrpc === "2.0"),
)

export const RPCReceiverV3 =
  () => (send: (event: ProcedureCallEvent) => void) => {
    console.log("subscribe")
    const subscription = rpcMessages.subscribe(
      async ({ data: rpcMessage, origin }) => {
        console.debug("RPCReceiverV3", { rpcMessage, origin })

        if (rpcMessage.params?.derivationOrigin || rpcMessage.params?.icrc95DerivationOrigin) {
          rpcMessage.params.derivationOrigin = rpcMessage.params.icrc95DerivationOrigin ?? rpcMessage.params.derivationOrigin
          delete rpcMessage.params['icrc95DerivationOrigin'];
        }

        return send({
          type: "ON_REQUEST",
          data: { data: rpcMessage, origin },
        })
      },
    )
    return () => subscription.unsubscribe()
  }
