import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class BnbTestnetService extends EVMService {
  protected readonly blockscoutBaseUrl = "https://bsc-testnet.blockscout.com"

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.BNB_TESTNET, INFURA_API_KEY)
  }
}

export const bnbTestnetService = new BnbTestnetService()
