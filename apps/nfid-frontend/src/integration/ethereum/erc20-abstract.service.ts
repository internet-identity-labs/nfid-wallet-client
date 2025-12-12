import { InfuraProvider, Interface, AbiCoder } from "ethers"
import { Address } from "../bitcoin/services/chain-fusion-signer.service"
import { chainFusionSignerService } from "../bitcoin/services/chain-fusion-signer.service"
import { SignIdentity } from "@dfinity/agent"
import { Contract } from "ethers"
import { TransactionResponse } from "ethers"
import { ethereumService } from "./eth/ethereum.service"
import { storageWithTtl } from "@nfid/client-db"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import { TokenPrice } from "packages/integration/src/lib/asset/types"

export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
]

// Multicall3 contract address (works on all EVM chains)
// Reference: https://medium.com/coinmonks/the-best-method-for-bulk-fetching-erc20-token-balances-99da12f4d839
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"

const ERC20_TOKENS_CACHE_KEY = "ERC20_TOKENS"
const CACHE_TTL = 60 * 1000 // 60 seconds

const MULTICALL3_ABI = [
  "function aggregate((address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, (address target, bytes callData)[] calls) payable returns (uint256 blockNumber, uint256 blockHash, (bool success, bytes returnData)[] returnData)",
]

export const ZERO = BigInt(0)

const ERC20_TOKENS_LIST_CACHE_KEY = "ERC20_TokensList"
const ERC20_TOKENS_LIST_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const ERC20_BALANCES_CACHE_TTL = 1 * 60 * 1000 // 1 minute in milliseconds

export interface ERC20TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  chainId: number
  state: State
}

export interface ERC20TokenWithBalance extends ERC20TokenInfo {
  balance: string
  error?: string
}

export abstract class Erc20Service {
  protected abstract provider: InfuraProvider
  protected abstract chainId: ChainId

  public async getTokensWithNonZeroBalance(
    normalizedAddress: string,
  ): Promise<ERC20TokenWithBalance[]> {
    // Get known tokens list for current chain
    const knownTokens = await this.getKnownTokensList()
    const chainTokens = knownTokens.filter(
      (token) => token.chainId === this.chainId,
    )

    if (chainTokens.length === 0) {
      return []
    }

    // Extract token addresses
    const tokenAddresses = chainTokens.map((token) => token.address)

    // Get balances for all known tokens using Multicall3
    const balances = await this.getMultipleTokenBalances(
      normalizedAddress,
      tokenAddresses,
    )

    // Create a map of known tokens for metadata lookup
    const knownTokensMap = new Map(
      chainTokens.map((token) => [token.address.toLowerCase(), token]),
    )

    // Filter tokens with non-zero balance and combine with metadata
    const tokensWithBalance: ERC20TokenWithBalance[] = balances
      .filter((balance) => {
        const balanceValue = BigInt(balance.balance || "0")
        return balanceValue > BigInt(0)
      })
      .map((balance) => {
        const tokenAddress = balance.contractAddress.toLowerCase()
        const knownToken = knownTokensMap.get(tokenAddress)

        if (!knownToken) {
          // Skip tokens not found in known list (should not happen)
          return null
        }

        return {
          address: tokenAddress,
          name: knownToken.name || "Unknown Token",
          symbol: knownToken.symbol || "UNKNOWN",
          decimals: knownToken.decimals || 18,
          logoURI: knownToken.logoURI,
          chainId: this.chainId,
          state: knownToken.state || State.Inactive,
          balance: balance.balance,
          error: balance.error,
        } as ERC20TokenWithBalance
      })
      .filter((token): token is ERC20TokenWithBalance => token !== null)

    return tokensWithBalance
  }

  public async getUSDPrices(addresses: string[]): Promise<TokenPrice[]> {
    if (addresses.length === 0) {
      return []
    }

    // Create cache key based on sorted addresses to ensure consistency
    const sortedAddresses = [...addresses].sort().join(",")
    const cacheKey = `${ERC20_TOKENS_CACHE_KEY}-${this.chainId}-${sortedAddresses}`

    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    let prices: Record<string, number>

    if (!cache) {
      // No cache, fetch and cache
      prices = await this.fetchAndCachePrices(addresses, cacheKey)
    } else if (!cache.expired) {
      // Cache exists and not expired, use it
      prices = cache.value as Record<string, number>
    } else {
      // Cache expired, return it immediately and refresh in background
      prices = cache.value as Record<string, number>
      // Refresh in background without waiting
      this.fetchAndCachePrices(addresses, cacheKey).catch((error) => {
        console.error("Failed to refresh token prices in background:", error)
      })
    }

    // Map to TokenPrice format
    return addresses.map((address) => ({
      token: address,
      price: prices[address.toLowerCase()] || 0,
    }))
  }

  private async fetchAndCachePrices(
    addresses: string[],
    cacheKey: string,
  ): Promise<Record<string, number>> {
    const defiLlamaChainId = this.getDefiLlamaChainId()
    // Format: chain:address1,chain:address2,...
    const tokensParam = addresses
      .map((addr) => `${defiLlamaChainId}:${addr.toLowerCase()}`)
      .join(",")

    const url = `https://coins.llama.fi/prices/current/${tokensParam}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const coins = data.coins || {}

    // Extract prices and normalize addresses to lowercase
    const prices: Record<string, number> = {}
    addresses.forEach((address) => {
      const key = `${defiLlamaChainId}:${address.toLowerCase()}`
      const coinData = coins[key]
      prices[address.toLowerCase()] = coinData?.price || 0
    })

    // Cache the result for 60 seconds
    await storageWithTtl.set(cacheKey, prices, CACHE_TTL)

    return prices
  }

  protected abstract getDefiLlamaChainId(): string

  public async getTokensList(): Promise<ERC20TokenInfo[]> {
    let allTokens = await this.getKnownTokensList()
    return allTokens.filter((token) => token.chainId === this.chainId)
  }

  /**
   * Get ERC20 token balances using Multicall3 contract - most efficient method
   * Reference: https://medium.com/coinmonks/the-best-method-for-bulk-fetching-erc20-token-balances-99da12f4d839
   *
   * This method uses Multicall3 to fetch all balances in a single request,
   * which is much faster and more cost-efficient than individual calls.
   * Results are cached per address.
   *
   * @param address - Wallet address to check balances for
   * @param contractAddresses - Array of ERC20 token contract addresses
   * @returns Array of balance objects with contractAddress, balance, and address
   */
  public async getMultipleTokenBalances(
    address: string,
    contractAddresses: string[],
  ) {
    if (contractAddresses.length === 0) {
      return []
    }

    // Single cache key per address (not per token list)
    const cacheKey = `ERC20_Balances_${address.toLowerCase()}`
    const normalizedAddress = address.toLowerCase()
    const normalizedContracts = contractAddresses.map((addr) =>
      addr.toLowerCase(),
    )

    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    // Cache structure: Map<contractAddress, { balance: string, address: string, error?: string }>
    let cachedBalances: Map<
      string,
      { balance: string; address: string; error?: string }
    > = new Map()

    if (cache) {
      // Restore cached balances from array to Map for easier lookup
      const cachedArray = cache.value as Array<{
        contractAddress: string
        balance: string
        address: string
        error?: string
      }>
      cachedArray.forEach((item) => {
        cachedBalances.set(item.contractAddress.toLowerCase(), {
          balance: item.balance,
          address: item.address,
          error: item.error,
        })
      })
    }

    // Check which contracts are missing from cache
    const missingContracts = normalizedContracts.filter(
      (contract) => !cachedBalances.has(contract),
    )

    // If all contracts are in cache and cache is not expired, return cached values
    if (missingContracts.length === 0 && cache && !cache.expired) {
      return normalizedContracts.map((contract) => ({
        contractAddress: contract,
        ...cachedBalances.get(contract)!,
      }))
    }

    // If cache exists but expired, return it immediately and refresh in background
    if (cache && cache.expired && missingContracts.length === 0) {
      // Refresh all requested contracts in background
      this.fetchAndUpdateCacheBalances(
        normalizedAddress,
        normalizedContracts,
        cacheKey,
      ).catch((error) => {
        console.error("Failed to refresh balances in background:", error)
      })

      // Return expired cache immediately
      return normalizedContracts.map((contract) => ({
        contractAddress: contract,
        ...cachedBalances.get(contract)!,
      }))
    }

    // Fetch all requested contracts (replace cache with new data)
    const fetchedBalances = await this.fetchAndUpdateCacheBalances(
      normalizedAddress,
      normalizedContracts,
      cacheKey,
    )

    // Return requested contracts
    return normalizedContracts.map((contract) => {
      const balance = fetchedBalances.get(contract)
      return {
        contractAddress: contract,
        balance: balance?.balance || "0",
        address: normalizedAddress,
        error: balance?.error,
      }
    })
  }

  /**
   * Fetch token balances and update cache
   * Replaces cache with new balances
   * @private
   */
  private async fetchAndUpdateCacheBalances(
    address: string,
    contractAddresses: string[],
    cacheKey: string,
  ): Promise<
    Map<string, { balance: string; address: string; error?: string }>
  > {
    try {
      // Use Multicall3 to get all balances in a single request
      const multicallInterface = new Interface(MULTICALL3_ABI)
      const erc20Interface = new Interface(ERC20_ABI)

      // Encode balanceOf call for each token
      const balanceOfData = erc20Interface.encodeFunctionData("balanceOf", [
        address,
      ])

      // Prepare calls for multicall - one call per token contract
      const calls = contractAddresses.map((contractAddress) => ({
        target: contractAddress,
        callData: balanceOfData,
      }))

      // Encode the aggregate function call
      const aggregateData = multicallInterface.encodeFunctionData("aggregate", [
        calls,
      ])

      // Execute all calls in one request using provider.call (read-only)
      // This is much more efficient than individual calls
      const result = await this.provider.call({
        to: MULTICALL3_ADDRESS,
        data: aggregateData,
      })

      // Decode the result
      const [, returnData] = multicallInterface.decodeFunctionResult(
        "aggregate",
        result,
      )

      // Decode results
      const abiCoder = new AbiCoder()
      const fetchedBalances = new Map<
        string,
        { balance: string; address: string; error?: string }
      >()

      contractAddresses.forEach((contractAddress, index) => {
        try {
          // Check if return data exists and is not empty
          const returnDataItem = returnData[index]
          if (
            !returnDataItem ||
            returnDataItem === "0x" ||
            returnDataItem.length === 0
          ) {
            fetchedBalances.set(contractAddress.toLowerCase(), {
              balance: "0",
              address,
              error: "Empty response from contract",
            })
            return
          }

          // Decode the uint256 balance from the return data
          const balance = abiCoder.decode(["uint256"], returnDataItem)[0]
          fetchedBalances.set(contractAddress.toLowerCase(), {
            balance: balance.toString(),
            address,
          })
        } catch (error) {
          console.error(
            `Error decoding balance for contract ${contractAddress}:`,
            error,
          )
          fetchedBalances.set(contractAddress.toLowerCase(), {
            balance: "0",
            address,
            error: error instanceof Error ? error.message : "Decode error",
          })
        }
      })

      // Convert Map to array for storage (replace cache, don't merge)
      const balancesArray = Array.from(fetchedBalances.entries()).map(
        ([contractAddress, balance]) => ({
          contractAddress,
          ...balance,
        }),
      )

      // Cache the result for 10 minutes (replace existing cache)
      await storageWithTtl.set(
        cacheKey,
        balancesArray,
        ERC20_BALANCES_CACHE_TTL,
      )

      return fetchedBalances
    } catch (error) {
      console.error("Multicall error, falling back to individual calls:", error)
      // Fallback to individual calls if multicall fails
      const fallbackBalances = await this.getMultipleTokenBalancesFallback(
        address,
        contractAddresses,
      )

      // Convert fallback to Map
      const fallbackMap = new Map<
        string,
        { balance: string; address: string; error?: string }
      >()
      fallbackBalances.forEach((item) => {
        fallbackMap.set(item.contractAddress.toLowerCase(), {
          balance: item.balance,
          address: item.address,
          error: item.error,
        })
      })

      // Convert Map to array for storage (replace cache, don't merge)
      const balancesArray = Array.from(fallbackMap.entries()).map(
        ([contractAddress, balance]) => ({
          contractAddress,
          ...balance,
        }),
      )

      // Cache the result (replace existing cache)
      await storageWithTtl.set(
        cacheKey,
        balancesArray,
        ERC20_BALANCES_CACHE_TTL,
      )

      return fallbackMap
    }
  }

  /**
   * Fallback method: Get balances using individual calls
   * Used when Multicall3 fails or is unavailable
   */
  private async getMultipleTokenBalancesFallback(
    address: string,
    contractAddresses: string[],
  ) {
    const balancePromises = contractAddresses.map(async (contractAddress) => {
      try {
        const erc20Contract = new Contract(
          contractAddress,
          ERC20_ABI,
          this.provider,
        )
        const balance = await erc20Contract.balanceOf(address)
        return {
          contractAddress,
          balance: balance.toString(),
          address,
        }
      } catch (error) {
        console.error(
          `Error getting balance for contract ${contractAddress}:`,
          error,
        )
        return {
          contractAddress,
          balance: "0",
          address,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    const results = await Promise.allSettled(balancePromises)
    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        return {
          contractAddress: contractAddresses[index],
          balance: "0",
          address,
          error: result.reason?.message || "Failed to fetch balance",
        }
      }
    })
  }

  getFeeData = async ({
    contractAddress,
    to,
    from,
    amount,
  }: {
    contractAddress: Address
    from: Address
    to: Address
    amount: bigint
  }): Promise<bigint> => {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )

    return erc20Contract.transfer.estimateGas(to, amount, { from })
  }

  public async estimateERC20Gas(
    contractAddress: Address,
    from: Address,
    amount: string,
    decimals: number,
  ): Promise<{
    gasUsed: bigint
    maxPriorityFeePerGas: bigint
    maxFeePerGas: bigint
    baseFeePerGas: bigint
    ethereumNetworkFee: bigint
  }> {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )

    const value = BigInt(Number(amount) * 10 ** decimals)

    const gas = erc20Contract.transfer.estimateGas(from, value, { from })
    const feeData = this.provider.getFeeData()
    const block = this.provider.getBlock("latest")

    return Promise.all([gas, feeData, block]).then(([gas, feeData, block]) => {
      if (
        feeData.maxFeePerGas === null ||
        feeData.maxPriorityFeePerGas === null
      ) {
        throw new Error("estimateERC20Gas: Gas fee data is missing")
      }
      return {
        gasUsed: gas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        baseFeePerGas: block?.baseFeePerGas ?? BigInt(0),
        ethereumNetworkFee: gas * feeData.maxFeePerGas,
      }
    })
  }

  public async sendErc20Transaction(
    identity: SignIdentity,
    contractAddress: Address,
    to: Address,
    value: string,
    decimals: number,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ): Promise<TransactionResponse> {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )
    const fromAddress = await ethereumService.getAddress(identity)
    const nonce = await this.provider.getTransactionCount(fromAddress)

    const valueBigInt = BigInt(Number(value) * 10 ** decimals)
    let trs = await erc20Contract.transfer.populateTransaction(to, valueBigInt)

    let trs_request: EthSignTransactionRequest = {
      //to: trs.to,
      to,
      value: valueBigInt,
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
      chain_id: BigInt(this.chainId),
    }
    debugger
    console.log(
      "this.chainId",
      this.chainId,
      this.provider,
      value,
      valueBigInt,
      gas,
    )
    let signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    console.debug("signedTransaction", signedTransaction)
    let response = await this.sendTransaction(signedTransaction)
    console.debug("response", response)
    return response
  }

  private async sendTransaction(
    signedTransaction: string,
  ): Promise<TransactionResponse> {
    try {
      const response =
        await this.provider.broadcastTransaction(signedTransaction)
      await response.wait()
      return response
    } catch (e) {
      throw e
    }
  }
  /**
   * Get list of all known ERC20 tokens with logos and metadata
   * Uses Uniswap Token Lists (standard format)
   * Results are cached for 24 hours
   *
   * @returns Array of token information with logos
   */
  protected async getKnownTokensList(): Promise<ERC20TokenInfo[]> {
    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(
      ERC20_TOKENS_LIST_CACHE_KEY,
    )

    // If no cache, fetch and wait for result
    if (!cache) {
      return await this.fetchAndCacheTokensList()
    }

    // If cache exists and not expired, return it
    if (cache && !cache.expired) {
      return cache.value as ERC20TokenInfo[]
    }

    // If cache exists but expired, return it immediately and refresh in background
    if (cache && cache.expired) {
      // Refresh in background without waiting
      this.fetchAndCacheTokensList().catch((error) => {
        console.error("Failed to refresh token list in background:", error)
      })

      // Return expired cache immediately
      return cache.value as ERC20TokenInfo[]
    }

    // Fallback (should not reach here)
    return await this.fetchAndCacheTokensList()
  }

  /**
   * Fetch tokens list from Uniswap API and cache it
   * @private
   */
  private async fetchAndCacheTokensList(): Promise<ERC20TokenInfo[]> {
    // Uniswap Token Lists - most comprehensive and maintained
    const tokenListUrl = `https://tokens.uniswap.org`

    const response = await fetch(tokenListUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status}`)
    }

    const data = await response.json()

    // Token List format: { tokens: [...] }
    const tokens = data.tokens || []

    const result = tokens
      .filter((token: any) => token.chainId)
      .map((token: any) => ({
        address: token.address?.toLowerCase() || "",
        name: token.name || "",
        symbol: token.symbol || "",
        decimals: token.decimals || 18,
        logoURI: token.logoURI,
        chainId: token.chainId,
        state: State.Inactive,
      }))
      .filter((token: ERC20TokenInfo) => token.address) // Remove invalid entries

    // Cache the result for 24 hours
    await storageWithTtl.set(
      ERC20_TOKENS_LIST_CACHE_KEY,
      result,
      ERC20_TOKENS_LIST_CACHE_TTL,
    )

    return result
  }
}
