import { InfuraProvider } from "ethers"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../evm.service"

export class ArbitrumService extends EVMService {
  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.ARB, INFURA_API_KEY)
  }
}

export const arbitrumService = new ArbitrumService()
