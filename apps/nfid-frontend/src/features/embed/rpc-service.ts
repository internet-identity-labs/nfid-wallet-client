import { filter, fromEvent, map } from "rxjs"

export const RPC_BASE = { jsonrpc: "2.0" }

interface RPCBase {
  jsonrpc: string
  id: string
}

export interface RPCMessage extends RPCBase {
  method: string
  params: any[]
}

interface RPCSuccessResponse extends RPCBase {
  result: any
}

interface RPCErrorResponse extends RPCBase {
  error: {
    code: number
    message: string
    data: any
  }
}

export type RPCResponse = RPCSuccessResponse | RPCErrorResponse

const windowMessages = fromEvent<MessageEvent<RPCMessage>>(window, "message")

export const rpcMessages = windowMessages.pipe(
  filter((event) => event.data && event.data.jsonrpc === "2.0"),
)

export const RPCService = () =>
  rpcMessages.pipe(
    map(({ data, origin }) => {
      switch (data.method) {
        case "eth_accounts":
          return { type: "CONNECT_ACCOUNT", data, origin }
        case "eth_sendTransaction":
          return { type: "SEND_TRANSACTION", data, origin }
        case "eth_signTypedData_v4":
          return { type: "SIGN_TYPED_DATA", data, origin }
        default:
          throw new Error(`Unknown method: ${data.method}`)
      }
    }),
  )
