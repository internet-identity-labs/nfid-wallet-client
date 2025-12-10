import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "../ft"
import { FTPolygonImpl } from "../impl/ft-pol-impl"
import { TokenBuilder } from "./token-builder"
import { FTERC20PolImpl } from "../impl/ft-erc20-pol-impl"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

export class PolygonTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTPolygonImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20PolImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
