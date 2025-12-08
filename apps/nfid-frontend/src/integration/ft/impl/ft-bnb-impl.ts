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

    // TODO: implement Bnb rate fetch
    // this.tokenRate =

    if (this.tokenBalance !== undefined) {
      this.inited = true
    }
  }
}
