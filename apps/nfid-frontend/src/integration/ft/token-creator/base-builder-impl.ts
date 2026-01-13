import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

import { FT } from "../ft"
import { FTBaseImpl } from "../impl/ft-base-impl"
import { FTERC20BaseImpl } from "../impl/ft-erc20-base-impl"

import { TokenBuilder } from "./token-builder"

export class BaseTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTBaseImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20BaseImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
