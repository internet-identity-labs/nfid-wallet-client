import { InfuraProvider } from "ethers"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { INFURA_API_KEY } from "@nfid/integration/token/constants"

export class BnbTestnetErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.BNB_TESTNET

  constructor() {
    super()
    this.provider = new InfuraProvider(
      BigInt(ChainId.BNB_TESTNET),
      INFURA_API_KEY,
    )
  }

  protected getDefiLlamaChainId(): string {
    return "bsc"
  }
}

export const bnbTestnetErc20Service = new BnbTestnetErc20Service()
