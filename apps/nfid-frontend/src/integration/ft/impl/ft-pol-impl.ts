import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import PolygonIcon from "packages/ui/src/organisms/tokens/assets/polygon.svg"
import BigNumber from "bignumber.js"

import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"
import {
  PolygonService,
  polygonService,
} from "frontend/integration/ethereum/polygon/polygon.service"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

export class FTPolygonImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: EVM_NATIVE,
      symbol: "POL",
      name: "Polygon",
      decimals: ETH_DECIMALS,
      category: Category.Native,
      logo: PolygonIcon,
      index: undefined,
      state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.POL
  }

  public getProvider(): PolygonService {
    return polygonService
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("Polygon balance fetch error: ", (e as Error).message)
      return
    }

    const prices = await polygonErc20Service.getUSDPrices([
      "0x0000000000000000000000000000000000001010",
    ])
    if (prices.length > 0) {
      this.tokenRate = {
        value: new BigNumber(prices[0].price),
        dayChangePercent: undefined,
        dayChangePercentPositive: undefined,
      }
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
