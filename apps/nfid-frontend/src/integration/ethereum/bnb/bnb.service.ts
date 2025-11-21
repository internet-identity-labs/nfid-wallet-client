import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { EVMTransactionService } from "../evm.service"

export const BNB_CHAIN_ID = 56

export class BnbService extends EVMTransactionService {
  constructor() {
    super()
    this.provider = new InfuraProvider(BNB_CHAIN_ID, INFURA_API_KEY)
  }
}

export const bnbService = new BnbService()
