import BigNumber from "bignumber.js"
import { Erc20Service } from "frontend/integration/ethereum/erc20-abstract.service"
import { POLYGON_ADDRESS } from "@nfid/integration/token/constants"
import { FTERC20AbstractImpl } from "./ft-erc20-abstract-impl"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

export class FTERC20PolImpl extends FTERC20AbstractImpl {
  getProvider(): Erc20Service {
    return polygonErc20Service
  }

  protected async fetchNativeTokenUsdRate(): Promise<BigNumber | undefined> {
    const prices = await polygonErc20Service.getUSDPrices([POLYGON_ADDRESS])
    return prices.length > 0 ? new BigNumber(prices[0].price) : undefined
  }

  getBlockExplorerLink(): string {
    return `https://polygonscan.com/address/${this.tokenAddress}`
  }
}
