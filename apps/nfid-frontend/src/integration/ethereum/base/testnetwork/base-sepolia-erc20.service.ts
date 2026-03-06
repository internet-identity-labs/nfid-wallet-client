import { InfuraProvider } from "ethers"
import { Erc20Service } from "../../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { INFURA_API_KEY } from "@nfid/integration/token/constants"

export class BaseSepoliaErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.BASE_SEPOLIA

  constructor() {
    super()
    this.provider = new InfuraProvider(
      BigInt(ChainId.BASE_SEPOLIA),
      INFURA_API_KEY,
    )
  }

  protected getDefiLlamaChainId(): string {
    return "base"
  }
}

export const baseSepoliaErc20Service = new BaseSepoliaErc20Service()
