import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"
import { FT } from "../../ft"
import { TokenBuilder } from "../token-builder"
import { FTERC20ArbSepoliaImpl } from "../../impl/testnetwork/ft-erc20-arb-sepolia-impl"
import { FTArbSepoliaImpl } from "../../impl/testnetwork/ft-arb-sepolia-impl"

export class ArbSepoliaTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTArbSepoliaImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20ArbSepoliaImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
