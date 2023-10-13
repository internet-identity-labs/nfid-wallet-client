import { functionCallDecoder } from "../function-call-decoder"
import {
  RpcMessageDecoder,
  RpcMessageFunctionalCall,
  parseHex,
} from "./rpc-message-decoder"

export const ethSendTransactionRpcMessageDecoder: RpcMessageDecoder = {
  method: "eth_sendTranscation",
  decode: async (
    [parameter]: any[],
    chainId: string,
  ): Promise<RpcMessageFunctionalCall> => {
    const data = await functionCallDecoder.decode(parameter.data, chainId)

    return Promise.resolve({
      interface: data.interface,
      method: data.method,
      data: data.data,
      from: parameter.from,
      to: parameter.to,
      maxFeePerGas: parseHex(parameter.maxFeePerGas),
      maxPriorityFeePerGas: parseHex(parameter.maxPriorityFeePerGas),
      value: parameter.value ? parseHex(parameter.value) : undefined,
    })
  },
}
