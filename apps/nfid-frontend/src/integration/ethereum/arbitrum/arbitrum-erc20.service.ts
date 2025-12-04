import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { INFURA_API_KEY } from "@nfid/integration/token/constants"

export class ArbitrumErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.ARB

  constructor() {
    super()
    this.provider = new InfuraProvider(BigInt(ChainId.ARB), INFURA_API_KEY)
  }

  protected getDefiLlamaChainId(): string {
    return "arbitrum"
  }
}

export const arbitrumErc20Service = new ArbitrumErc20Service()
