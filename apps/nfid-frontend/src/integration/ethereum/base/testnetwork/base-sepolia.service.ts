import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class BaseSepoliaService extends EVMService {
  protected readonly blockscoutBaseUrl = "https://base-sepolia.blockscout.com"

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.BASE_SEPOLIA, INFURA_API_KEY)
  }
}

export const baseSepoliaService = new BaseSepoliaService()
