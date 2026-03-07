import { InfuraProvider } from "ethers"

import { INFURA_API_KEY, CHAIN_ID } from "@nfid/integration/token/constants"
import { EVMService } from "../evm.service"

export class EthereumService extends EVMService {
  protected provider: InfuraProvider
  protected readonly blockscoutBaseUrl = "https://eth.blockscout.com"

  constructor() {
    super()
    this.provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
  }
}

export const ethereumService = new EthereumService()
