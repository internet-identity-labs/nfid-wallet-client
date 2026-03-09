import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "../../ft"
import { FTPolygonAmoyImpl } from "../../impl/testnetwork/ft-pol-amoy-impl"

import { TokenBuilder } from "../token-builder"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"
import { FTERC20PolAmoyImpl } from "../../impl/testnetwork/ft-erc20-pol-amoy-impl"

export class PolygonAmoyTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTPolygonAmoyImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20PolAmoyImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
