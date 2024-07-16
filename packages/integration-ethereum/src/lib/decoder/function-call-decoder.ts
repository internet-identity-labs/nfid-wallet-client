import { createRaribleSdk } from "@rarible/sdk"
import { Fragment } from "ethers/lib/utils"

import { RPCMessage } from "../decode-ethereum-function-call"
import { erc721AssetDecoder } from "./asset-decoder/erc721-asset-decoder/erc721-asset-decoder"
import { erc721AssetLazyDecoder } from "./asset-decoder/erc721-asset-decoder/erc721-asset-lazy-decoder"
import { erc1155AssetDecoder } from "./asset-decoder/erc1155-asset-decoder/erc1155-asset-decoder"
import { erc1155TokenLazyDecoder } from "./asset-decoder/erc1155-asset-decoder/erc1155-asset-lazy-decoder"
import { dependencyService } from "./dependency-service"
import { functionCallService } from "./function-call-service"
import { approveMethodDecoder } from "./method-decoder/approve/approve-method-decoder"
import { bulkPurchaseMethodDecoder } from "./method-decoder/bulk-purchase/bulk-purchase-method-decoder"
import { burnMethodDecoder } from "./method-decoder/burn/burn-method-decoder"
import { cancelMethodDecoder } from "./method-decoder/cancel/cancel-method-decoder"
import { createTokenPrivateMethodDecoder } from "./method-decoder/create-token/create-token-private/create-token-private-method-decoder"
import { createTokenPublicMethodDecoder } from "./method-decoder/create-token/create-token-public/create-token-public-method-decoder"
import { directAcceptBidMethodDecoder } from "./method-decoder/direct-accept-bid/direct-accept-bid-method-decoder"
import { directPurchaseMethodDecoder } from "./method-decoder/direct-purchase/direct-purchase-method-decoder"
import {
  FunctionCall,
  Method,
  MethodDecoder,
} from "./method-decoder/method-decoder"
import { mintAndTransferMethodDecoder } from "./method-decoder/mint/mint-and-transfer-method-decoder"
import { safeTransferFromMethodDecoder } from "./method-decoder/safe-transfer-from/safe-transfer-from-method-decoder"
import { setApprovalForAllMethodDecoder } from "./method-decoder/set-approval-for-all/set-approval-for-all-method-decoder"
import { ethSendTransactionRpcMessageDecoder } from "./rpc-message-decoder/eth-sendtransaction-rpc-message-decoder"
import { personalSignRpcMessageDecoder } from "./rpc-message-decoder/personal-sign-decoder"
import {
  RpcMessageFunctionalCall,
  RpcMessageDecoder,
} from "./rpc-message-decoder/rpc-message-decoder"
import { signTypedDataV4RpcMessageDecoder } from "./rpc-message-decoder/sign-typed-data-v4-rpc-message-decoder."

const methodDecoders: Record<string, MethodDecoder> = dependencyService.group([
  cancelMethodDecoder,
  directAcceptBidMethodDecoder,
  burnMethodDecoder,
  safeTransferFromMethodDecoder,
  bulkPurchaseMethodDecoder,
  directPurchaseMethodDecoder,
  createTokenPrivateMethodDecoder,
  createTokenPublicMethodDecoder,
  mintAndTransferMethodDecoder,
  setApprovalForAllMethodDecoder,
  approveMethodDecoder,
])
const assetDecoders = dependencyService.group([
  erc721AssetDecoder,
  erc721AssetLazyDecoder,
  erc1155AssetDecoder,
  erc1155TokenLazyDecoder,
])
const rpcMessageDecoders: { [key: string]: RpcMessageDecoder } = {
  eth_sendTransaction: ethSendTransactionRpcMessageDecoder,
  eth_signTypedData_v4: signTypedDataV4RpcMessageDecoder,
  personal_sign: personalSignRpcMessageDecoder,
}

export const functionCallDecoder = {
  decode(data: string, chainId: string): Promise<FunctionCall> {
    const method = data.substring(0, 10)
    const methodDecoder = methodDecoders[method]

    if (!methodDecoder) {
      throw new Error("No method decoder found")
    }

    const fragment = methodDecoder.getAbi() as Fragment
    const decodedData = functionCallService.decode(data, fragment)
    return methodDecoder.map(decodedData, chainId)
  },

  async decodeByAssetClass(
    type: string,
    data: string,
    chainId: string,
    method: Method = "sell",
  ): Promise<FunctionCall> {
    const assetDecoder = assetDecoders[type]

    if (!assetDecoder) {
      throw new Error("No asset decoder found")
    }

    const tokenId = assetDecoder.map(data)
    const env = chainId === "0x01" ? "prod" : "testnet"
    const raribleKey =
      env === "prod" ? PROD_RARIBLE_X_API_KEY : RARIBLE_X_API_KEY
    const sdk = createRaribleSdk(null, env, { apiKey: raribleKey })
    const [item, collection] = await Promise.all([
      await sdk.apis.item.getItemById({
        itemId: `ETHEREUM:${tokenId.collectionId}:${tokenId.tokenId}`,
      }),
      await sdk.apis.collection.getCollectionById({
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
  },

  async decodeRpcMessage({
    method,
    params,
    options,
  }: RPCMessage): Promise<RpcMessageFunctionalCall> {
    const rpcMessageDecoder = rpcMessageDecoders[method]

    if (!rpcMessageDecoder) {
      throw new Error("No rpc message decoder found")
    }

    const data = await rpcMessageDecoder.decode(params, options.chainId ?? "")

    if (["directPurchase"].includes(data.method) && !params[0].value) {
      throw Error("Not a native token.")
    }

    return data
  },
}
