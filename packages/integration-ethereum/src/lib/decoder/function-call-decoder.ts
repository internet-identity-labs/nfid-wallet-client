import { IRaribleSdk, createRaribleSdk } from "@rarible/sdk"
import { Fragment } from "ethers/lib/utils"

import { AssetDecoder } from "./asset-decoder/asset-decoder"
import { erc721AssetDecoder } from "./asset-decoder/erc721-asset-decoder/erc721-asset-decoder"
import { erc721AssetLazyDecoder } from "./asset-decoder/erc721-asset-decoder/erc721-asset-lazy-decoder"
import { erc1155AssetDecoder } from "./asset-decoder/erc1155-asset-decoder/erc1155-asset-decoder"
import { erc1155TokenLazyDecoder } from "./asset-decoder/erc1155-asset-decoder/erc1155-asset-lazy-decoder"
import { dependencyService } from "./dependency-service"
import { functionCallService } from "./function-call-service"
import { bulkPurchaseMethodDecoder } from "./method-decoder/bulk-purchase/bulk-purchase-method-decoder"
import { burnMethodDecoder } from "./method-decoder/burn/burn-method-decoder"
import { cancelMethodDecoder } from "./method-decoder/cancel/cancel-method-decoder"
import { createTokenPrivateMethodDecoder } from "./method-decoder/create-token/create-token-private/create-token-private-method-decoder"
import { createTokenPublicMethodDecoder } from "./method-decoder/create-token/create-token-public/create-token-public-method-decoder"
import { directAcceptBidMethodDecoder } from "./method-decoder/direct-accept-bid/direct-accept-bid-method-decoder"
import { directPurchaseMethodDecoder } from "./method-decoder/direct-purchase/direct-purchase-method-decoder"
import { MethodDecoder, FunctionCall } from "./method-decoder/method-decoder"
import { mintAndTransferMethodDecoder } from "./method-decoder/mint/mint-and-transfer-method-decoder"
import { safeTransferFromMethodDecoder } from "./method-decoder/safe-transfer-from/safe-transfer-from-method-decoder"

export class FunctionCallDecoder {
  private sdk: IRaribleSdk
  private methodDecoders: {
    [key: string]: MethodDecoder
  }
  private assetDecoders: {
    [key: string]: AssetDecoder
  }

  constructor(
    sdk: IRaribleSdk,
    methodDecoders: {
      [key: string]: MethodDecoder
    },
    assetDecoders: {
      [key: string]: AssetDecoder
    },
  ) {
    this.sdk = sdk
    this.methodDecoders = methodDecoders
    this.assetDecoders = assetDecoders
  }

  decode(data: string): Promise<FunctionCall> {
    const method = data.substring(0, 10)
    const methodDecoder = this.methodDecoders[method]

    if (!methodDecoder) {
      throw new Error("No method decoder found")
    }

    const fragment = methodDecoder.getAbi() as Fragment
    const decodedData = functionCallService.decode(data, fragment)
    return methodDecoder.map(decodedData)
  }

  async decodeByAssetClass(
    type: string,
    data: string,
    method: string,
  ): Promise<FunctionCall> {
    const assetDecoder = this.assetDecoders[type]

    if (!assetDecoder) {
      throw new Error("No asset decoder found")
    }

    const tokenId = assetDecoder.map(data)
    const [item, collection] = await Promise.all([
      await this.sdk.apis.item.getItemById({
        itemId: `ETHEREUM:${tokenId.collectionId}:${tokenId.tokenId}`,
      }),
      await this.sdk.apis.collection.getCollectionById({
        collection: `ETHEREUM:${tokenId?.collectionId}`,
      }),
    ])

    return {
      interface: "Item",
      method: method,
      data: {
        ...item,
        collectionData: collection,
      },
    }
  }
}

const sdk = createRaribleSdk(null, "testnet")
const methodDecoders = dependencyService.group([
  cancelMethodDecoder,
  directAcceptBidMethodDecoder,
  burnMethodDecoder,
  safeTransferFromMethodDecoder,
  bulkPurchaseMethodDecoder,
  directPurchaseMethodDecoder,
  createTokenPrivateMethodDecoder,
  createTokenPublicMethodDecoder,
  mintAndTransferMethodDecoder,
])
const assetDecoders = dependencyService.group([
  erc721AssetDecoder,
  erc721AssetLazyDecoder,
  erc1155AssetDecoder,
  erc1155TokenLazyDecoder,
])

export const functionCallDecoder = new FunctionCallDecoder(
  sdk,
  methodDecoders,
  assetDecoders,
)
