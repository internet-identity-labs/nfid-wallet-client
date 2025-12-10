import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "../ft"
import { FTERC20BnbImpl } from "../impl/ft-erc20-bnb-impl"
import { FTBnbImpl } from "../impl/ft-bnb-impl"
import { TokenBuilder } from "./token-builder"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

export class BnbTokenBuilder implements TokenBuilder {
  buildNative(state: State = State.Inactive): FT {
    return new FTBnbImpl(state)
  }

  buildTokens(tokenData: ERC20TokenInfo, state?: State): FT {
    return new FTERC20BnbImpl({
      ...tokenData,
      state: state ?? tokenData.state,
    })
  }
}
