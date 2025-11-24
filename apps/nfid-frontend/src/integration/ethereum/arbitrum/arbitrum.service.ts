import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { EVMTransactionService } from "../evm.service"

export const ARBITRUM_CHAIN_ID = 42161

export class ArbitrumService extends EVMTransactionService {
  constructor() {
    super()
    this.provider = new InfuraProvider(ARBITRUM_CHAIN_ID, INFURA_API_KEY)
  }
}

export const arbitrumService = new ArbitrumService()
