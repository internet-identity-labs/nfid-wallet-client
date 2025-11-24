import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { EVMTransactionService } from "../evm.service"

export const POLYGON_CHAIN_ID = 137

export class PolygonService extends EVMTransactionService {
  constructor() {
    super()
    this.provider = new InfuraProvider(POLYGON_CHAIN_ID, INFURA_API_KEY)
  }
}

export const polygonService = new PolygonService()
