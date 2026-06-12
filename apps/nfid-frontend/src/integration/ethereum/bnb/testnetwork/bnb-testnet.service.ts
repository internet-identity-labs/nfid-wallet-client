import { InfuraProvider } from "ethers"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"

export class BnbTestnetService extends EVMService {
  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.BNB_TESTNET, INFURA_API_KEY)
  }
}

export const bnbTestnetService = new BnbTestnetService()
