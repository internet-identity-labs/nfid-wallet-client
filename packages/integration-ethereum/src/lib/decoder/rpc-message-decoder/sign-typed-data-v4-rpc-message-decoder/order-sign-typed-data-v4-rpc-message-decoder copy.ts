import { functionCallDecoder } from "../../function-call-decoder"
import { ErcMessageFunctionalCall } from "../rpc-message-decoder"
import { SignTypedDataV4RpcMessageDecoder } from "../sign-typed-data-v4-rpc-message-decoder."

export const orderSignTypedDataV4RpcMessageDecoder: SignTypedDataV4RpcMessageDecoder =
  {
    decode: async (
      from: string,
      json: any,
    ): Promise<ErcMessageFunctionalCall> => {
      const asset = json.message.makeAsset.assetType
      const data = await functionCallDecoder.decodeByAssetClass(
        asset.assetClass,
        asset.data,
      )

      return Promise.resolve({
        interface: "Item",
        method: "Order",
        data: data.data,
        from: from,
      })
    },
  }
