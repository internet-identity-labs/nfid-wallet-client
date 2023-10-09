import { functionCallDecoder } from "./decoder/function-call-decoder"
import { FunctionCall, Method } from "./decoder/method-decoder/method-decoder"
import { RpcMessageFunctionalCall } from "./decoder/rpc-message-decoder/rpc-message-decoder"

export interface RPCBase {
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

export async function decodeRpcMessage(
  rpcMessage: RPCMessage,
): Promise<RpcMessageFunctionalCall> {
  return functionCallDecoder.decodeRpcMessage(rpcMessage)
}

export async function decode(
  data: string,
  chainId: string,
): Promise<FunctionCall> {
  return functionCallDecoder.decode(data, chainId)
}

export async function decodeTokenByAssetClass(
  type: string,
  data: string,
  chainId: string,
  method: Method = "sell",
): Promise<FunctionCall> {
  return functionCallDecoder.decodeByAssetClass(type, data, chainId, method)
}
