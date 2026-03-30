import { InfuraProvider } from "ethers"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getInfuraProvider } from "../../infura-provider-registry"

export class PolygonAmoyErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.POL_AMOY

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.POL_AMOY)
  }

  protected getDefiLlamaChainId(): string {
    return "polygon"
  }
}

export const polygonAmoyErc20Service = new PolygonAmoyErc20Service()
