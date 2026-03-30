import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getInfuraProvider } from "../infura-provider-registry"

export class BnbErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.BNB

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.BNB)
  }

  protected getDefiLlamaChainId(): string {
    return "bsc"
  }
}

export const bnbErc20Service = new BnbErc20Service()
