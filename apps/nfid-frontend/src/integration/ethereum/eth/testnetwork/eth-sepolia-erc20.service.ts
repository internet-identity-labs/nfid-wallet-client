import { InfuraProvider } from "ethers"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getInfuraProvider } from "../../infura-provider-registry"

export class EthSepoliaErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.ETH_SEPOLIA

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.ETH_SEPOLIA)
  }

  protected getDefiLlamaChainId(): string {
    return "ethereum"
  }
}

export const ethSepoliaErc20Service = new EthSepoliaErc20Service()
