import { CHAIN_ID, INFURA_API_KEY } from "@nfid/integration/token/constants"
import { InfuraProvider } from "ethers"
import { Erc20Service } from "../erc20-abstract.service"
import { ERC20TokenWithBalance } from "../erc20-abstract.service"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"

export class EthereumErc20Service extends Erc20Service {
  protected provider: InfuraProvider
  protected chainId: ChainId = ChainId.ETH

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
    // Use different base URL for mainnet vs Sepolia
    const baseUrl =
      CHAIN_ID === BigInt(1)
        ? "https://api.ethplorer.io"
        : "https://sepolia-api.ethplorer.io"

    const url = `${baseUrl}/getAddressInfo/${normalizedAddress.toLowerCase()}?apiKey=freekey`

    console.debug("Ethplorer API URL:", url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.debug("Ethplorer API response:", data)

    // Ethplorer returns: { address, ETH: {...}, tokens: [{ tokenInfo, balance, totalIn, totalOut }] }
    if (!data.tokens || !Array.isArray(data.tokens)) {
      return []
    }

    // Get known tokens list for metadata (logoURI, etc.)
    const knownTokens = await this.getKnownTokensList()
    const knownTokensMap = new Map(
      knownTokens.map((token) => [token.address.toLowerCase(), token]),
    )

    // Filter tokens with non-zero balance and combine with metadata
    const tokensWithBalance: ERC20TokenWithBalance[] = data.tokens
      .filter((token: any) => {
        // Balance is in token units (not wei), so we need to check if it's > 0
        const balance = parseFloat(token.balance || "0")
        return balance > 0
      })
      .map((token: any) => {
        const tokenAddress = token.tokenInfo?.address?.toLowerCase() || ""
        const knownToken = knownTokensMap.get(tokenAddress)

        // Ethplorer returns balance in token units (not wei)
        // We need to convert to wei format: balance * 10^decimals
        const decimals = token.tokenInfo?.decimals || knownToken?.decimals || 18
        const balanceInTokenUnits = parseFloat(token.balance || "0")
        const balanceInWei = BigInt(
          Math.floor(balanceInTokenUnits * 10 ** decimals),
        ).toString()

        return {
          address: tokenAddress,
          name: knownToken?.name || token.tokenInfo?.name || "Unknown Token",
          symbol: knownToken?.symbol || token.tokenInfo?.symbol || "UNKNOWN",
          decimals: decimals,
          logoURI: knownToken?.logoURI || token.tokenInfo?.image,
          chainId: CHAIN_ID,
          state: knownToken?.state || State.Inactive,
          balance: balanceInWei,
        }
      })

    return tokensWithBalance
  }
}

export const ethErc20Service = new EthereumErc20Service()
