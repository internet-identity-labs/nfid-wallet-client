import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"
import { FT } from "../../ft"
import { TokenBuilder } from "../token-builder"
import { FTBaseSepoliaImpl } from "../../impl/testnetwork/ft-base-sepolia-impl"
import { FTERC20BaseSepoliaImpl } from "../../impl/testnetwork/ft-erc20-base-sepolia-impl"

export class BaseSepoliaTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTBaseSepoliaImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20BaseSepoliaImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
