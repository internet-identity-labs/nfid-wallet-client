import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "../ft"
import { FTArbitrumImpl } from "../impl/ft-arb-impl"
import { TokenBuilder } from "./token-builder"
import { FTERC20ArbImpl } from "../impl/ft-erc20-arb-impl"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

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
