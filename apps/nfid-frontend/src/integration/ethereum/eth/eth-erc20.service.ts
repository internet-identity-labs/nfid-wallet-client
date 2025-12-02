import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class EthereumErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.ETH

  constructor() {
    super()
    this.provider = new InfuraProvider(BigInt(ChainId.ETH), INFURA_API_KEY)
  }

  protected getDefiLlamaChainId(): string {
    return "ethereum"
  }
}

export const ethErc20Service = new EthereumErc20Service()
