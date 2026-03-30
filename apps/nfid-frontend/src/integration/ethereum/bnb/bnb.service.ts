import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../evm.service"
import { getInfuraProvider } from "../infura-provider-registry"

export class BnbService extends EVMService {
  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.BNB)
  }
}

export const bnbService = new BnbService()
