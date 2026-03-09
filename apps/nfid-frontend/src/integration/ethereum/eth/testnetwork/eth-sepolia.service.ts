import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class EthSepoliaService extends EVMService {
  protected provider: InfuraProvider
  protected readonly blockscoutBaseUrl = "https://eth-sepolia.blockscout.com"

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.ETH_SEPOLIA, INFURA_API_KEY)
  }
}

export const ethSepoliaService = new EthSepoliaService()
