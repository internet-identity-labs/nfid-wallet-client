import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import BnbIcon from "packages/ui/src/organisms/tokens/assets/bnb.svg"

import { BNB_NATIVE_ID, ETH_DECIMALS } from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"
import {
  BnbService,
  bnbService,
} from "frontend/integration/ethereum/bnb/bnb.service"
import { exchangeRateService } from "@nfid/integration"

export class FTBnbImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: BNB_NATIVE_ID,
      symbol: "BNB",
      name: "BNB",
      decimals: ETH_DECIMALS,
      category: Category.Native,
      logo: BnbIcon,
      index: undefined,
      state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.BNB
  }

  protected getProvider(): BnbService {
    return bnbService
  }

  public async getBalance(): Promise<void> {
    try {
      this.tokenBalance = await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("BnbService error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForERC20(
        "0x455e53cbb86018ac2b8092fdcd39d8444affc3f6",
      )
    } catch (e) {
      console.error("BNB rate fetch error: ", (e as Error).message)
    }

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
