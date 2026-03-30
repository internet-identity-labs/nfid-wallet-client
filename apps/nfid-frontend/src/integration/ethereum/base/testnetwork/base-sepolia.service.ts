import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"
import { getInfuraProvider } from "../../infura-provider-registry"

export class BaseSepoliaService extends EVMService {
  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.BASE_SEPOLIA)
  }
}

export const baseSepoliaService = new BaseSepoliaService()
