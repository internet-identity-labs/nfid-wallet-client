import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import {
  ARBITRUM_NATIVE_ID,
  ETH_DECIMALS,
} from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"
import {
  arbitrumService,
  ArbitrumService,
} from "frontend/integration/ethereum/arbitrum/arbitrum.service"

export class FTArbitrumImpl extends FTEvmAbstractImpl {
  constructor() {
    super({
      ledger: ARBITRUM_NATIVE_ID,
      symbol: "ETH",
      name: "Ethereum",
      decimals: ETH_DECIMALS,
      category: Category.Native,
      logo: EthIcon,
      index: undefined,
      state: State.Active,
      fee: BigInt(0),
      rootCanisterId: undefined,
    })
    this.tokenChainId = ChainId.ARB
  }

  protected getProvider(): ArbitrumService {
    return arbitrumService
  }
}
