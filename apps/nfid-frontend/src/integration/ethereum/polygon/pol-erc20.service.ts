import { INFURA_API_KEY } from "@nfid/integration/token/constants"
import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ERC20TokenWithBalance } from "../erc20-abstract.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class PolygonErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.POL

  constructor() {
    super()
    this.provider = new InfuraProvider(BigInt(ChainId.ETH), INFURA_API_KEY)
  }

  /**
   * Get tokens with balance using Ethplorer API
   * Free API, no key required for basic usage
   * Supports mainnet and Sepolia testnet
   * USE IT ONLY FOR SCAN FEATURE
   */
  public async getTokensWithNonZeroBalance(
    normalizedAddress: string,
  ): Promise<ERC20TokenWithBalance[]> {
    return []
  }
}

export const polygonErc20Service = new PolygonErc20Service()
