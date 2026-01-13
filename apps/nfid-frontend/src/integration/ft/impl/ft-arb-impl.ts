import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "@nfid/ui/organisms/tokens/assets/ethereum.svg"

import {
  arbitrumService,
  ArbitrumService,
} from "frontend/integration/ethereum/arbitrum/arbitrum.service"

import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"

export class FTArbitrumImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: EVM_NATIVE,
      symbol: "ETH",
      name: "Ethereum",
      decimals: ETH_DECIMALS,
      category: Category.Native,
      logo: EthIcon,
      index: undefined,
      state,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.ARB
  }

  public getProvider(): ArbitrumService {
    return arbitrumService
  }
}
