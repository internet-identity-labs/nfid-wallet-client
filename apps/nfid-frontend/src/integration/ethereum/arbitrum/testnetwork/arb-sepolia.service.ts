import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"
import { getInfuraProvider } from "../../infura-provider-registry"

export class ArbSepoliaService extends EVMService {
  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.ARB_SEPOLIA)
  }
}

export const arbSepoliaService = new ArbSepoliaService()
