import { InfuraProvider } from "ethers"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getInfuraProvider } from "../../infura-provider-registry"

export class ArbSepoliaErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.ARB_SEPOLIA

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.ARB_SEPOLIA)
  }

  protected getDefiLlamaChainId(): string {
    return "arbitrum"
  }
}

export const arbSepoliaErc20Service = new ArbSepoliaErc20Service()
