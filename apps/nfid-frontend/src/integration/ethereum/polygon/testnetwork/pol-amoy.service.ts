import { InfuraProvider } from "ethers"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class PolygonAmoyService extends EVMService {
  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.POL_AMOY, INFURA_API_KEY)
  }
}

export const polygonAmoyService = new PolygonAmoyService()
