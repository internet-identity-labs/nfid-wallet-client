import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import PolygonIcon from "packages/ui/src/organisms/tokens/assets/polygon.svg"
import BigNumber from "bignumber.js"

import {
  ETH_DECIMALS,
  EVM_NATIVE,
  POLYGON_ADDRESS,
} from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "../ft-evm-abstract-impl"
import {
  PolygonAmoyService,
  polygonAmoyService,
} from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy.service"
import { polygonAmoyErc20Service } from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy-erc20.service"

export class FTPolygonAmoyImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: EVM_NATIVE,
      symbol: "POL",
      name: "Polygon Amoy",
      decimals: ETH_DECIMALS,
      category: Category.TESTNET,
      logo: PolygonIcon,
      index: undefined,
      state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.POL_AMOY
  }

  public getProvider(): PolygonAmoyService {
    return polygonAmoyService
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("Polygon Amoy balance fetch error: ", (e as Error).message)
      return
    }

    const prices = await polygonAmoyErc20Service.getUSDPrices([POLYGON_ADDRESS])
    if (prices.length > 0) {
      this.tokenRate = {
        value: new BigNumber(prices[0].price),
        dayChangePercent: undefined,
        dayChangePercentPositive: undefined,
      }
    }

    this.inited = true
  }
}
