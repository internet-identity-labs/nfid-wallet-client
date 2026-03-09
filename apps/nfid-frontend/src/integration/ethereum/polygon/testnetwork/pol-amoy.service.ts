import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class PolygonAmoyService extends EVMService {
  protected readonly blockscoutBaseUrl = "https://polygon-amoy.blockscout.com"

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.POL_AMOY, INFURA_API_KEY)
  }
}

export const polygonAmoyService = new PolygonAmoyService()
