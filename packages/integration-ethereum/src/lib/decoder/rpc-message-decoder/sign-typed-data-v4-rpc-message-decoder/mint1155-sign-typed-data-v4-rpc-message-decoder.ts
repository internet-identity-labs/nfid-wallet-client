import { RpcMessageFunctionalCall } from "../rpc-message-decoder"
import { SignTypedDataV4RpcMessageDecoder } from "../sign-typed-data-v4-rpc-message-decoder."

export type MintLazy1155 = {
  contract: string
  uri: string
  tokenId: string
  supply: string
  account: string
}

export const mint1155SignTypedDataV4RpcMessageDecoder: SignTypedDataV4RpcMessageDecoder =
  {
    decode: async (
      from: string,
      json: any,
    ): Promise<RpcMessageFunctionalCall> => {
      const { contract, uri, tokenId, supply, creators } = json.message
      const { account } = creators[0]
      return Promise.resolve({
        interface: "MintLazy1155",
        method: "Mint1155",
        from,
        data: {
          contract,
          uri,
          tokenId,
          supply,
          account,
        },
      })
    },
  }
