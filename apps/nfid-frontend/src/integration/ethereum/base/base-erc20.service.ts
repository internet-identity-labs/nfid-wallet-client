import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getInfuraProvider } from "../infura-provider-registry"

export class BaseErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.BASE

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.BASE)
  }

  protected getDefiLlamaChainId(): string {
    return "base"
  }
}

export const baseErc20Service = new BaseErc20Service()
