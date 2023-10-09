import { BigNumber } from "ethers"

import { decode } from "../../../decode-ethereum-function-call"
import {
  DecodedFunctionCall,
  FunctionCall,
  Item,
  MethodDecoder,
} from "../method-decoder"
import { bulkPurchaseAbi } from "./bulk-purchase-abi"

export type Buy = {
  amount: BigNumber
  fees: BigNumber
  item: Item
  marketId: number
}

export type BulkPurchase = FunctionCall & {
  data: {
    allowFail: boolean
    feeRecipientFirst: number
    feeRecipientSecond: number
    items: Buy[]
  }
}

class BulkPurchaseMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return bulkPurchaseAbi
  }

  getMethod(): string {
    return "0xb94ee332"
  }

  async map(
    { inputs }: DecodedFunctionCall,
    chainId: string,
  ): Promise<BulkPurchase> {
    const [itemsData, feeRecipientFirst, feeRecipientSecond, allowFail] = inputs

    const itemPromises = itemsData.map(async (item: any) => {
      const [marketId, amount, fees, itemData] = item
      const decodedItem = await decode(itemData, chainId)
      return {
        amount: amount.toString(),
        fees: fees.toString(),
        item: decodedItem,
        marketId,
      }
    })

    const items = await Promise.all(itemPromises)

    return Promise.resolve({
      interface: "BatchBuyRequest",
      method: "bulkPurchase",
      data: {
        allowFail: allowFail as boolean,
        feeRecipientFirst: parseInt(feeRecipientFirst, 16),
        feeRecipientSecond: parseInt(feeRecipientSecond, 16),
        items,
      },
    })
  }
}

export const bulkPurchaseMethodDecoder = new BulkPurchaseMethodDecoder()
