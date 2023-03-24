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
  type: "RPC_MESSAGE"
  data: ProcedureDetails
}

export const RPCReceiverV2 =
  () => (send: (event: ProcedureCallEvent) => void) => {
    const subsciption = rpcMessages.subscribe(
      async ({ data: rpcMessage, origin }) => {
        const rpcMessageDecoded = await decodeMessage(rpcMessage)

        switch (rpcMessage.method) {
          case "eth_accounts":
            return send({
              type: "RPC_MESSAGE",
              data: { rpcMessage, rpcMessageDecoded, origin },
            })
          case "eth_sendTransaction":
          case "eth_signTypedData_v4":
            return send({
              type: "RPC_MESSAGE",
              data: { rpcMessage, rpcMessageDecoded, origin },
            })
          default:
            throw new Error(
              `RPCReceiverV2 unknown method: ${rpcMessage.method}`,
            )
        }
      },
    )
    return () => subsciption.unsubscribe()
  }

const decodeMessage = async (
  rpcMessage: RPCMessage,
): Promise<FunctionCall | undefined> => {
  try {
    return await decodeRpcMessage(rpcMessage)
  } catch (error: any) {
    console.warn("decodeRPCMEssage", { error })
    return undefined
  }
}
