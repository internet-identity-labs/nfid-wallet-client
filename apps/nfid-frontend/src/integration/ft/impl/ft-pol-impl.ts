import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import PolygonIcon from "packages/ui/src/organisms/tokens/assets/polygon.svg"

import {
  ETH_DECIMALS,
  POLYGON_NATIVE_ID,
} from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"
import {
  PolygonService,
  polygonService,
} from "frontend/integration/ethereum/polygon/polygon.service"
import { exchangeRateService } from "@nfid/integration"

export class FTPolygonImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: POLYGON_NATIVE_ID,
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

  protected getProvider(): PolygonService {
    return polygonService
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("PolygonService error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForERC20("POL")
    } catch (e) {
      console.error("Polygon rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
