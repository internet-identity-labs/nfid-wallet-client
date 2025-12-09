import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { TokenBuilder } from "./token-builder"
import { EthereumTokenBuilder } from "./ethereum-builder-impl"
import { PolygonTokenBuilder } from "./polygon-builder-impl"
import { ArbitrumTokenBuilder } from "./arbitrum-builder-impl"
import { BaseTokenBuilder } from "./base-builder-impl"
import { BnbTokenBuilder } from "./bnb-builder-impl"
import { BitcoinTokenBuilder } from "./bitcoin-builder-impl"
import { ICRC1TokenBuilder } from "./icrc1-builder-impl"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"
import { ERC20TokenInfo } from "frontend/integration/ethereum/erc20-abstract.service"

export class TokenFactoryService {
  private builders = new Map<ChainId, TokenBuilder<ICRC1 | ERC20TokenInfo>>([
    [ChainId.ETH, new EthereumTokenBuilder()],
    [ChainId.POL, new PolygonTokenBuilder()],
    [ChainId.ARB, new ArbitrumTokenBuilder()],
    [ChainId.BASE, new BaseTokenBuilder()],
    [ChainId.BNB, new BnbTokenBuilder()],
    [ChainId.BTC, new BitcoinTokenBuilder()],
    [ChainId.ICP, new ICRC1TokenBuilder()],
  ])

  getCreatorByChainID(chainId: ChainId): TokenBuilder<ICRC1 | ERC20TokenInfo> {
    const builder = this.builders.get(chainId)
    if (!builder) {
      throw new Error(`No TokenBuilder registered for chainId: ${chainId}`)
    }
    return builder
  }
}

export const tokenFactory = new TokenFactoryService()
