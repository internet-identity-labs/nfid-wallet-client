import { ErcMessageFunctionalCall } from "../rpc-message-decoder"
import { SignTypedDataV4RpcMessageDecoder } from "../sign-typed-data-v4-rpc-message-decoder."

export type Mint721 = {
  contract: string
  uri: string
  tokenId: string
}

export const mint721SignTypedDataV4RpcMessageDecoder: SignTypedDataV4RpcMessageDecoder =
  {
    decode: async (
      from: string,
      json: any,
    ): Promise<ErcMessageFunctionalCall> => {
      const { contract, uri, tokenId } = json.message
      return Promise.resolve({
        interface: "Mint721",
        method: "Mint721",
        from,
        data: {
          contract,
          uri,
          tokenId,
        },
      })
    },
  }
