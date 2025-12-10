import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"
import { FT } from "../ft"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

export interface TokenBuilder<T = ERC20TokenInfo> {
  buildNative(state?: State): FT
  buildTokens(tokenData: T, state?: State): FT
}
