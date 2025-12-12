import { FT } from "../ft"
import { FTBitcoinImpl } from "../impl/ft-btc-impl"
import { ERC20TokenInfo } from "../../ethereum/erc20-abstract.service"
import { TokenBuilder } from "./token-builder"

export class BitcoinTokenBuilder implements TokenBuilder {
  buildNative(): FT {
    return new FTBitcoinImpl()
  }

  buildTokens(_tokenData: ERC20TokenInfo): FT {
    throw new Error("Bitcoin chain does not support ERC-20 tokens")
  }
}
