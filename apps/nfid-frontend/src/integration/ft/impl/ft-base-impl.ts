import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { BASE_NATIVE_ID, ETH_DECIMALS } from "@nfid/integration/token/constants"
import { FTEvmAbstractImpl } from "./ft-evm-abstract-impl"
import {
  BaseService,
  baseService,
} from "frontend/integration/ethereum/base/base.service"

export class FTBaseImpl extends FTEvmAbstractImpl {
  constructor(state: State) {
    super({
      ledger: BASE_NATIVE_ID,
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
    this.tokenChainId = ChainId.BASE
  }

  public getProvider(): BaseService {
    return baseService
  }
}
