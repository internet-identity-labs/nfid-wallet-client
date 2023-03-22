import { filter, fromEvent, map } from "rxjs"

import { decodeRpcMessage, FunctionCall } from "@nfid/integration-ethereum"

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

export const RPCReceiver = () =>
  rpcMessages.pipe(
    map(async ({ data, origin }) => {
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

type ProcedureDetails = {
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  origin: string
}

export type ProcedureCallEvent = {
  type: "PROCEDURE_CALL"
  data: ProcedureDetails
}

export const RPCReceiverV2 =
  () => (send: (event: ProcedureCallEvent) => void) => {
    const subsciption = rpcMessages.subscribe(async ({ data, origin }) => {
      switch (data.method) {
        case "eth_accounts":
        case "eth_sendTransaction":
        case "eth_signTypedData_v4":
          return send({
            type: "PROCEDURE_CALL",
            data: {
              rpcMessage: data,
              rpcMessageDecoded: await decodeMessage(data),
              origin,
            },
          })
        default:
          throw new Error(`RPCReceiverV2 unknown method: ${data.method}`)
      }
    })
    return () => subsciption.unsubscribe()
  }

const decodeMessage = async (
  rpcMessage: RPCMessage,
): Promise<FunctionCall | undefined> => {
  try {
    decodeRpcMessage(rpcMessage)
  } catch (error: any) {
    console.warn("decodeRPCMEssage", { error })
    return undefined
  }
}
