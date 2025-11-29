import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { ETH_DECIMALS, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import {
  EthereumService,
  ethereumService,
} from "frontend/integration/ethereum/eth/ethereum.service"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"

export class FTEthereumImpl extends FTEvmAbstractImpl {
  constructor() {
    super({
      ledger: ETH_NATIVE_ID,
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
    this.tokenChainId = ChainId.ETH
  }

  protected getProvider(): EthereumService {
    return ethereumService
  }
}
