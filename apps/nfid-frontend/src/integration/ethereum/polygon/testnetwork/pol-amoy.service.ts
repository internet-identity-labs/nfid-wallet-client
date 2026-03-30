import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"
import { getInfuraProvider } from "../../infura-provider-registry"

export class PolygonAmoyService extends EVMService {
  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.POL_AMOY)
  }
}

export const polygonAmoyService = new PolygonAmoyService()
