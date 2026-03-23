import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import {
  CKETH_LEDGER_CANISTER_ID,
  ETH_DECIMALS,
  EVM_NATIVE,
} from "@nfid/integration/token/constants"

import {
  BaseSepoliaService,
  baseSepoliaService,
} from "frontend/integration/ethereum/base/testnetwork/base-sepolia.service"
import { FTEvmAbstractImpl } from "../ft-evm-abstract-impl"
import { exchangeRateService } from "@nfid/integration"

export class FTBaseSepoliaImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: EVM_NATIVE,
      symbol: "ETH",
      name: "Ethereum Sepolia",
      decimals: ETH_DECIMALS,
      category: Category.TESTNET,
      logo: EthIcon,
      index: undefined,
      state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.BASE_SEPOLIA
  }

  public getProvider(): BaseSepoliaService {
    return baseSepoliaService
  }

  public async fetchEvmBalance(viewOnlyAddress?: string): Promise<void> {
    try {
      this.tokenBalance = viewOnlyAddress
        ? await this.getProvider().getBalance(viewOnlyAddress)
        : await this.getProvider().getQuickBalance()
    } catch (e) {
      console.error("Base Sepolia balance fetch error: ", (e as Error).message)
      return
    }

    try {
      this.tokenRate = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )
    } catch (e) {
      this.tokenRate = null
    }

    this.inited = true
  }
}
