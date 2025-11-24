import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { EVMTransactionService } from "../evm.service"

export const BASE_CHAIN_ID = 8453

export class BaseService extends EVMTransactionService {
  constructor() {
    super()
    this.provider = new InfuraProvider(BASE_CHAIN_ID, INFURA_API_KEY)
  }
}

export const baseService = new BaseService()
