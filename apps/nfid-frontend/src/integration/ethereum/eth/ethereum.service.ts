import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { EVMService } from "../evm.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class EthereumService extends EVMService {
  protected provider: InfuraProvider

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.ETH, INFURA_API_KEY)
  }
}

export const ethereumService = new EthereumService()
