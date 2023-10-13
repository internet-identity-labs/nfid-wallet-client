import { filter, fromEvent } from "rxjs"

import { decodeRpcMessage, FunctionCall } from "@nfid/integration-ethereum"

import { validateDerivationOrigin } from "frontend/integration/internet-identity/validateDerivationOrigin"

export const RPC_BASE = { jsonrpc: "2.0" }

export interface RPCBase {
  origin: string
  jsonrpc: string
  id: string
}

export type NfidRpcOptions = {
  chainId?: string
  rpcUrl?: string
}

export interface RPCMessage extends RPCBase {
  method: string
  params: any[]
  options: NfidRpcOptions
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

export type RPCResponse = RPCSuccessResponse | RPCErrorResponse

const windowMessages = fromEvent<MessageEvent<RPCMessage>>(window, "message")

export const rpcMessages = windowMessages.pipe(
  filter((event) => event.data && event.data.jsonrpc === "2.0"),
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

const validateRPCMessage = async (rpcMessage: RPCMessage, origin: string) => {
  const params = rpcMessage.params[0]
  if (params && params.derivationOrigin) {
    // What are we doing if 3rd party without derivationOrigin
    console.debug("validateRPCMessage", {
      derivationOrigin: params.derivationOrigin,
      origin,
    })
    const response = await validateDerivationOrigin(
      origin,
      params.derivationOrigin,
    )
    if (response.result === "invalid") {
      window.parent.postMessage(
        {
          ...RPC_BASE,
          id: rpcMessage.id,
          error: { code: 400, message: response.message },
        },
        origin,
      )
      throw new Error(response.message)
    }
  }
}

export const RPCReceiverV2 =
  () => (send: (event: ProcedureCallEvent) => void) => {
    const subsciption = rpcMessages.subscribe(
      async ({ data: rpcMessage, origin }) => {
        console.debug("RPCReceiverV2", { rpcMessage, origin })
        await validateRPCMessage(rpcMessage, origin)
        switch (rpcMessage.method) {
          case "ic_renewDelegation":
          case "ic_canisterCall":
          case "ic_getDelegation":
          case "ic_requestTransfer":
          case "eth_accounts":
            console.debug(`RPCReceiverV2 ${rpcMessage.method}`, {
              rpcMessage,
              origin,
            })
            return send({
              type: "RPC_MESSAGE",
              data: { rpcMessage, origin },
            })
          case "eth_sendTransaction":
            const rpcMessageDecoded = await decodeMessage(rpcMessage)

            return send({
              type: "RPC_MESSAGE",
              data: {
                rpcMessage,
                rpcMessageDecoded,
                origin,
              },
            })
          case "eth_signTypedData_v4":
            const rpcMessageDecodedTypedData = await decodeMessage(rpcMessage)
            return send({
              type: "RPC_MESSAGE",
              data: {
                rpcMessage,
                rpcMessageDecoded: rpcMessageDecodedTypedData,
                origin,
              },
            })
          case "personal_sign":
            const rpcMessagePersonalSign = await decodeMessage(rpcMessage)
            return send({
              type: "RPC_MESSAGE",
              data: {
                rpcMessage,
                rpcMessageDecoded: rpcMessagePersonalSign,
                origin,
              },
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
