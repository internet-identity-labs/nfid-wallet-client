import { functionCallDecoder } from "./decoder/function-call-decoder"
import { FunctionCall, Method } from "./decoder/method-decoder/method-decoder"
import { RpcMessageFunctionalCall } from "./decoder/rpc-message-decoder/rpc-message-decoder"

export interface RPCMessage {
  method: string
  params: any[]
}

export async function decodeRpcMessage(
  rpcMessage: RPCMessage,
): Promise<RpcMessageFunctionalCall> {
  return functionCallDecoder.decodeRpcMessage(rpcMessage)
}

export async function decode(data: string): Promise<FunctionCall> {
  return functionCallDecoder.decode(data)
}

export async function decodeTokenByAssetClass(
  type: string,
  data: string,
  method: Method = "sell",
): Promise<FunctionCall> {
  return functionCallDecoder.decodeByAssetClass(type, data, method)
}
