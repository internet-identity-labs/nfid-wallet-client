import { AssetType } from "../../asset-decoder/asset-decoder-service"
import { functionCallDecoder } from "../../function-call-decoder"
import { Method } from "../../method-decoder/method-decoder"
import { RpcMessageFunctionalCall } from "../rpc-message-decoder"
import { SignTypedDataV4RpcMessageDecoder } from "../sign-typed-data-v4-rpc-message-decoder."

export const orderSignTypedDataV4RpcMessageDecoder: SignTypedDataV4RpcMessageDecoder =
  {
    decode: async (
      from: string,
      json: any,
    ): Promise<RpcMessageFunctionalCall> => {
      const makeAsset = json.message.makeAsset.assetType
      const takeAsset = json.message.takeAsset.assetType

      // if the first element is NFI, then it's a sell, otherwise it's a bid.
      const isSell = Object.values(AssetType).includes(makeAsset.assetClass)
      const asset = isSell
        ? { method: "SellOrder" as Method, value: makeAsset }
        : { method: "BidOrder" as Method, value: takeAsset }

      const data = await functionCallDecoder.decodeByAssetClass(
        asset.value.assetClass,
        asset.value.data,
      )

      return Promise.resolve({
        interface: "Item",
        method: asset.method,
        data: data.data,
        from: from,
        total: Number(json?.message?.takeAsset?.value) / 10 ** 18,
      })
    },
  }
