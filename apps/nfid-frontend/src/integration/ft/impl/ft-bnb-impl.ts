import { EVM_NATIVE, ETH_DECIMALS } from "@nfid/integration/token/constants"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import BnbIcon from "@nfid/ui/organisms/tokens/assets/bnb.svg"

import {
  BnbService,
  bnbService,
} from "frontend/integration/ethereum/bnb/bnb.service"

import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"

export class FTBnbImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: EVM_NATIVE,
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

  public getProvider(): BnbService {
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
