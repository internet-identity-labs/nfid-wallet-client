import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../evm.service"
import { getInfuraProvider } from "../infura-provider-registry"

export class PolygonService extends EVMService {
  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.POL)
  }
}

export const polygonService = new PolygonService()
