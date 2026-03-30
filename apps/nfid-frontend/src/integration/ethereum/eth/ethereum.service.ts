import { InfuraProvider } from "ethers"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../evm.service"
import { getInfuraProvider } from "../infura-provider-registry"

export class EthereumService extends EVMService {
  protected provider: InfuraProvider

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.ETH)
  }
}

export const ethereumService = new EthereumService()
