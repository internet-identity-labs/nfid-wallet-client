import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

import { FT } from "../ft"
import { FTArbitrumImpl } from "../impl/ft-arb-impl"
import { FTERC20ArbImpl } from "../impl/ft-erc20-arb-impl"

import { TokenBuilder } from "./token-builder"

export class ArbitrumTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTArbitrumImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20ArbImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
