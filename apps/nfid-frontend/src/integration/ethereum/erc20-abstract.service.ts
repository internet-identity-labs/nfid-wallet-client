import {
  InfuraProvider,
  Interface,
  AbiCoder,
  Contract,
  TransactionResponse,
  id,
  zeroPadValue,
  getAddress,
} from "ethers"
import { Address } from "../bitcoin/services/chain-fusion-signer.service"
import { chainFusionSignerService } from "../bitcoin/services/chain-fusion-signer.service"
import { SignIdentity } from "@dfinity/agent"
import { ethereumService } from "./eth/ethereum.service"
import { storageWithTtl, ttlCacheService } from "@nfid/client-db"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import { TokenPrice } from "packages/integration/src/lib/asset/types"
import { authState } from "packages/integration/src/lib/authentication/auth-state"

export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
]

export const ERC20_APPROVAL_ABI = [
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
]

export interface EvmAllowance {
  contract: string
  spender: string
  allowance: bigint
}

// Multicall3 contract address (works on all EVM chains)
// Reference: https://medium.com/coinmonks/the-best-method-for-bulk-fetching-erc20-token-balances-99da12f4d839
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"

export const ERC20_TOKENS_CACHE_NAME = "ERC20_TOKENS-"
export const ERC20_BALANCES_CACHE_NAME = "ERC20_Balances_"
const CACHE_TTL = 60 * 1000 // 60 seconds

const MULTICALL3_ABI = [
  "function aggregate((address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, (address target, bytes callData)[] calls) payable returns (uint256 blockNumber, uint256 blockHash, (bool success, bytes returnData)[] returnData)",
]

export const ZERO = BigInt(0)

export const ERC20_TOKENS_LIST_CACHE_NAME = "ERC20_TokensList"
const ERC20_TOKENS_LIST_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const ERC20_ALLOWANCES_CACHE_TTL = 60 * 1000 // 60 seconds

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

  // Request queue: Map<key, Promise<result>> - same parameters share the same promise
  private getMultipleTokenBalancesQueue = new Map<
    string,
    Promise<
      Array<{
        contractAddress: string
        balance: string
        address: string
        error?: string
      }>
    >
  >()

  // One in-flight request per (owner, chainId) — all tokens share the same promise
  private getEvmAllowancesQueue = new Map<
    string,
    Promise<Array<EvmAllowance>>
  >()

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

    const root = authState.getUserIdData().anchor
    const cacheKey = `${ERC20_TOKENS_CACHE_NAME}${root}-${this.chainId}`

    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    const cacheHasAllAddresses =
      !!cache &&
      addresses.every(
        (address) =>
          address.toLowerCase() in (cache.value as Record<string, number>),
      )

    let prices: Record<string, number>

    if (!cacheHasAllAddresses) {
      prices = await this.fetchAndCachePrices(addresses, cacheKey)
    } else {
      prices = cache!.value as Record<string, number>
      if (cache!.expired) {
        this.fetchAndCachePrices(addresses, cacheKey).catch((error) =>
          console.error("Failed to refresh token prices in background:", error),
        )
      }
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
    const allTokens = await this.getKnownTokensList()
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
   * If multiple requests with the same parameters are made simultaneously,
   * they will share the same promise and receive the same result.
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

    const normalizedAddress = address.toLowerCase()
    const normalizedContracts = contractAddresses.map((addr) =>
      addr.toLowerCase(),
    )

    // Create queue key: address + sorted contractAddresses
    const sortedContracts = [...normalizedContracts].sort().join(",")
    const queueKey = `${normalizedAddress}:${sortedContracts}`

    // Check if there's already an in-flight request with the same parameters
    const existingPromise = this.getMultipleTokenBalancesQueue.get(queueKey)
    if (existingPromise) {
      // Return the result of the existing request
      return existingPromise
    }

    // Create a new promise for this request
    const promise = this._getMultipleTokenBalancesInternal(
      normalizedAddress,
      normalizedContracts,
    ).finally(() => {
      // Remove from queue after completion (success or error)
      this.getMultipleTokenBalancesQueue.delete(queueKey)
    })

    // Save the promise in the queue
    this.getMultipleTokenBalancesQueue.set(queueKey, promise)

    return promise
  }

  /**
   * Internal implementation of getMultipleTokenBalances
   * @private
   */
  private async _getMultipleTokenBalancesInternal(
    normalizedAddress: string,
    normalizedContracts: string[],
  ) {
    // Single cache key per address (not per token list)
    const cacheKey =
      `${ERC20_BALANCES_CACHE_NAME}${normalizedAddress}_` + this.chainId

    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    // Cache structure: Map<contractAddress, { balance: string, address: string, error?: string }>
    const cachedBalances: Map<
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
      const cached = (await storageWithTtl.get(cacheKey)) as Array<{
        contractAddress: string
        balance: string
        address: string
        error?: string
      }> | null
      if (cached) {
        const cachedBalances = new Map<
          string,
          { balance: string; address: string; error?: string }
        >()
        cached.forEach((item) => {
          cachedBalances.set(item.contractAddress.toLowerCase(), {
            balance: item.balance,
            address: item.address,
            error: item.error,
          })
        })
        return cachedBalances
      }

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

      const randomTtlMs = 20000 + Math.floor(Math.random() * 10000)

      // Cache the result for random TTL between 20s and 30s to avoid thundering herd on expiry
      await storageWithTtl.set(cacheKey, balancesArray, randomTtlMs)

      return fetchedBalances
    } catch (error) {
      console.error("Multicall error, falling back to individual calls:", error)
      throw error
    }
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
    to: Address,
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

    const gas = erc20Contract.transfer.estimateGas(to, value, { from })
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
    const trs = await erc20Contract.transfer.populateTransaction(
      to,
      valueBigInt,
    )

    const trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: ZERO,
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
      chain_id: BigInt(this.chainId),
    }
    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    console.debug("signedTransaction", signedTransaction)
    const response = await this.sendTransaction(signedTransaction)
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
    return ttlCacheService.getOrFetch(
      ERC20_TOKENS_LIST_CACHE_NAME,
      () => this.fetchTokensList(),
      ERC20_TOKENS_LIST_CACHE_TTL,
      {
        onBackgroundError: (error) =>
          console.error("Failed to refresh token list in background:", error),
      },
    )
  }

  private async fetchTokensList(): Promise<ERC20TokenInfo[]> {
    const tokenListUrl = `https://tokens.uniswap.org`

    const response = await fetch(tokenListUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status}`)
    }

    const data = await response.json()

    // Token List format: { tokens: [...] }
    const tokens = data.tokens || []

    return tokens
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
      .filter((token: ERC20TokenInfo) => token.address)
  }

  /**
   * Get all active ERC20 allowances for a given owner across all provided contracts.
   *
   * Single getLogs call per (owner, chainId) — results are cached for
   * ERC20_ALLOWANCES_CACHE_TTL. Concurrent calls with the same key share the
   * same in-flight promise so only one request reaches the node.
   *
   * Requires an archive-capable RPC (e.g. Alchemy) for full historical coverage.
   */
  public async getEvmAllowances(
    ownerAddress: string,
    contractAddresses: string[],
  ): Promise<Array<EvmAllowance>> {
    if (contractAddresses.length === 0) return []

    const normalizedOwner = ownerAddress.toLowerCase()
    const cacheKey = `ERC20_Allowances_${normalizedOwner}_${this.chainId}`

    const existing = this.getEvmAllowancesQueue.get(cacheKey)
    if (existing) return existing

    const promise = this._fetchEvmAllowances(
      normalizedOwner,
      contractAddresses,
      cacheKey,
    ).finally(() => this.getEvmAllowancesQueue.delete(cacheKey))

    this.getEvmAllowancesQueue.set(cacheKey, promise)
    return promise
  }

  private async _fetchEvmAllowances(
    ownerAddress: string,
    contractAddresses: string[],
    cacheKey: string,
  ): Promise<Array<EvmAllowance>> {
    const cached = (await storageWithTtl.get(cacheKey)) as EvmAllowance[] | null
    if (cached) return cached

    const approvalTopic = id("Approval(address,address,uint256)")
    const paddedOwner = zeroPadValue(ownerAddress, 32)
    const approvalInterface = new Interface(ERC20_APPROVAL_ABI)

    const logs = await this.provider.getLogs({
      address: contractAddresses,
      topics: [approvalTopic, paddedOwner],
      fromBlock: 0,
      toBlock: "latest",
    })

    // Deduplicate (contract, spender) pairs — keep the last seen entry per key.
    // Only pairs that ever had an Approval event end up here, NOT all tokens.
    const pairs = new Map<string, { contract: string; spender: string }>()
    for (const log of logs) {
      const parsed = approvalInterface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      })
      if (!parsed) continue
      const spender: string = getAddress(parsed.args.spender)
      const key = `${log.address.toLowerCase()}:${spender.toLowerCase()}`
      pairs.set(key, { contract: log.address, spender })
    }

    if (pairs.size === 0) {
      await storageWithTtl.set(cacheKey, [], ERC20_ALLOWANCES_CACHE_TTL)
      return []
    }

    // Batch all allowance(owner, spender) reads into a single Multicall3 request
    // to avoid N separate eth_call round-trips.
    const multicallInterface = new Interface(MULTICALL3_ABI)
    const approvalIface = new Interface(ERC20_APPROVAL_ABI)
    const pairsArray = [...pairs.values()]

    const calls = pairsArray.map(({ contract, spender }) => ({
      target: contract,
      callData: approvalIface.encodeFunctionData("allowance", [
        ownerAddress,
        spender,
      ]),
    }))

    const aggregateData = multicallInterface.encodeFunctionData(
      "tryBlockAndAggregate",
      [false, calls],
    )

    const raw = await this.provider.call({
      to: MULTICALL3_ADDRESS,
      data: aggregateData,
    })

    const [, , returnData] = multicallInterface.decodeFunctionResult(
      "tryBlockAndAggregate",
      raw,
    )

    const abiCoder = new AbiCoder()
    const results = pairsArray.map(({ contract, spender }, index) => {
      try {
        const { success, returnData: data } = returnData[index]
        if (!success || !data || data === "0x") {
          return { contract, spender, allowance: BigInt(0) }
        }
        const [value] = abiCoder.decode(["uint256"], data)
        return { contract, spender, allowance: value as bigint }
      } catch {
        return { contract, spender, allowance: BigInt(0) }
      }
    })

    const allowances = results.filter((r) => r.allowance > BigInt(0))
    await storageWithTtl.set(cacheKey, allowances, ERC20_ALLOWANCES_CACHE_TTL)
    return allowances
  }

  /**
   * Set (or revoke) an ERC20 allowance by broadcasting an approve(spender, amount) tx.
   * Pass amount = BigInt(0) to revoke. Invalidates the allowances cache on success.
   */
  public async setERC20Allowance(
    identity: SignIdentity,
    contractAddress: string,
    spender: string,
    amount: bigint,
    chainId: ChainId,
  ): Promise<void> {
    const erc20 = new Contract(
      contractAddress,
      ERC20_APPROVAL_ABI,
      this.provider,
    )
    const fromAddress = await ethereumService.getAddress(identity)
    const nonce = await this.provider.getTransactionCount(fromAddress)

    const trs = await erc20.approve.populateTransaction(spender, amount)

    const feeData = await this.provider.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("setERC20Allowance: gas fee data is missing")
    }

    const gasUsed = await this.provider.estimateGas({
      to: contractAddress,
      from: fromAddress,
      data: trs.data,
    })

    const trs_request: EthSignTransactionRequest = {
      to: contractAddress,
      value: ZERO,
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gasUsed,
      max_priority_fee_per_gas: feeData.maxPriorityFeePerGas,
      max_fee_per_gas: feeData.maxFeePerGas,
      chain_id: BigInt(chainId),
    }

    const signedTx = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    const response = await this.provider.broadcastTransaction(signedTx)
    await response.wait()

    // Invalidate cached allowances so the next read reflects the new state
    const cacheKey = `ERC20_Allowances_${fromAddress.toLowerCase()}_${this.chainId}`
    await storageWithTtl.set(cacheKey, [], 1)
  }
}
