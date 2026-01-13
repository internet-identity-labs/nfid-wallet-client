import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { EVMService } from "../evm.service"

export class PolygonService extends EVMService {
  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.POL, INFURA_API_KEY)
  }
}

export const polygonService = new PolygonService()
