import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { Erc20Service } from "../erc20-abstract.service"

export class BaseErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.BASE

  constructor() {
    super()
    this.provider = new InfuraProvider(BigInt(ChainId.BASE), INFURA_API_KEY)
  }

  protected getDefiLlamaChainId(): string {
    return "base"
  }
}

export const baseErc20Service = new BaseErc20Service()
