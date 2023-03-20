import { functionCallDecoder } from "../function-call-decoder"
import {
  ErcMessageDecoder,
  ErcMessageFunctionalCall,
  parseHex,
} from "./rpc-message-decoder"

export const ethSendTransactionRpcMessageDecoder: ErcMessageDecoder = {
  method: "eth_sendTranscation",
  decode: async ([parameter]: any[]): Promise<ErcMessageFunctionalCall> => {
    const data = await functionCallDecoder.decode(parameter.data)

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
