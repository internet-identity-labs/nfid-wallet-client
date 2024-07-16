import {
  RpcMessageDecoder,
  RpcMessageFunctionalCall,
} from "./rpc-message-decoder"
import { mint721SignTypedDataV4RpcMessageDecoder } from "./sign-typed-data-v4-rpc-message-decoder/mint721-sign-typed-data-v4-rpc-message-decoder"
import { mint1155SignTypedDataV4RpcMessageDecoder } from "./sign-typed-data-v4-rpc-message-decoder/mint1155-sign-typed-data-v4-rpc-message-decoder"
import { orderSignTypedDataV4RpcMessageDecoder } from "./sign-typed-data-v4-rpc-message-decoder/order-sign-typed-data-v4-rpc-message-decoder copy"

export type SignTypedDataV4RpcMessageDecoder = {
  decode: (
    from: string,
    json: object,
    chainId: string,
  ) => Promise<RpcMessageFunctionalCall>
}

const decoders: { [key: string]: SignTypedDataV4RpcMessageDecoder } = {
  Order: orderSignTypedDataV4RpcMessageDecoder,
  Mint721: mint721SignTypedDataV4RpcMessageDecoder,
  Mint1155: mint1155SignTypedDataV4RpcMessageDecoder,
}

export const signTypedDataV4RpcMessageDecoder: RpcMessageDecoder = {
  method: "eth_signTypedData_v4",
  decode: async (
    [from, parameter]: any[],
    chainId: string,
  ): Promise<RpcMessageFunctionalCall> => {
    const json = JSON.parse(parameter)
    const type = json.primaryType

    const decoder = decoders[type]

    if (!decoder) {
      throw new Error("No sign typed data decoder found")
    }

    return decoder.decode(from, json, chainId)
  },
}
