import { RpcMessageFunctionalCall } from "../rpc-message-decoder"
import { SignTypedDataV4RpcMessageDecoder } from "../sign-typed-data-v4-rpc-message-decoder."

export type MintLazy721 = {
  contract: string
  uri: string
  tokenId: string
  royalties: any[]
  creators: any[]
}

export const mint721SignTypedDataV4RpcMessageDecoder: SignTypedDataV4RpcMessageDecoder =
  {
    decode: async (
      from: string,
      json: any,
    ): Promise<RpcMessageFunctionalCall> => {
      const { contract, uri, tokenId, royalties, creators } = json.message

      return Promise.resolve({
        interface: "MintLazy721",
        method: "Mint721",
        from,
        data: {
          contract,
          uri,
          tokenId,
          royalties,
          creators,
        },
      })
    },
  }
