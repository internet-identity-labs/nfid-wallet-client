import {
  RpcMessageDecoder,
  RpcMessageFunctionalCall,
} from "./rpc-message-decoder"

export const personalSignRpcMessageDecoder: RpcMessageDecoder = {
  method: "personal_sign",
  decode: async (params: string[]): Promise<RpcMessageFunctionalCall> => {
    const message = Buffer.from(params[0].slice(2), "hex").toString("utf8")
    const from = params[1]

    return Promise.resolve({
      interface: "PersonalSign",
      method: "personalSign",
      data: { message },
      from: from,
    })
  },
}
