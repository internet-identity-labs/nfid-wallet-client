import { FT } from "../ft"
import { FTImpl } from "../impl/ft-impl"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"
import { TokenBuilder } from "./token-builder"

export class ICRC1TokenBuilder implements TokenBuilder<ICRC1> {
  buildNative(): FT {
    throw new Error("ICRC1 chain will not implement this method")
  }

  buildTokens(tokenData: ICRC1): FT {
    return new FTImpl(tokenData)
  }
}
