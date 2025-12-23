import {
  ETH_DECIMALS,
  ETH_NATIVE_ID,
  ETHERSCAN_API_KEY,
} from "@nfid/integration/token/constants"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"
import { storageWithTtl } from "@nfid/client-db"
import { Erc20Service } from "./erc20-abstract.service"
import { ERC20TokenInfo } from "./erc20-abstract.service"
import { IActivityRow } from "frontend/features/activity/types"

export interface EtherscanTransaction {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
}

export interface EtherscanResponse {
  status: string
  message: string
  result: EtherscanTransaction[]
}

export interface EtherscanTokenResponse {
  status: string
  message: string
  result: EtherscanTokenTransaction[]
}

export interface EtherscanTokenTransaction {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  transactionIndex: string
  gas: string
  gasPrice: string
  gasUsed: string
  cumulativeGasUsed: string
  input: string
  confirmations: string
}

export interface EVMTransactionService {
  getActivitiesRows(address: string): Promise<IActivityRow[]>
}

export abstract class EVMTokenTransactionService
  implements EVMTransactionService
{
  protected abstract getChainId(): number

  protected abstract getService(): Erc20Service

  protected getUrl(address: string): string {
    return `https://api.etherscan.io/v2/api?chainid=${this.getChainId()}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
  }

  public async getActivitiesRows(address: string): Promise<IActivityRow[]> {
    const chainId = this.getChainId()
    const normalizedAddress = address.toLowerCase()
    const cacheKey = `EVM_ACTIVITIES_${chainId}_${normalizedAddress}`

    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    if (cache && !cache.expired) {
      return cache.value as IActivityRow[]
    }

    // If cache expired, return it immediately and refresh in background
    if (cache && cache.expired) {
      this.fetchAndCacheActivities(address, cacheKey).catch((error) => {
        console.error("Failed to refresh activities in background:", error)
      })
      return cache.value as IActivityRow[]
    }

    // No cache, fetch and cache
    return await this.fetchAndCacheActivities(address, cacheKey)
  }

  private async fetchAndCacheActivities(
    address: string,
    cacheKey: string,
  ): Promise<IActivityRow[]> {
    try {
      // Get ERC20 token transactions
      const tokenUrl = this.getUrl(address)

      console.debug(
        "Fetching ERC20 token transactions from Etherscan for address:",
        address,
      )
      const tokenResponse = await fetch(tokenUrl)
      const tokenData: EtherscanTokenResponse = await tokenResponse.json()

      console.debug("Etherscan ERC20 response:", tokenData)

      if (
        tokenData.status !== "1" ||
        !tokenData.result ||
        tokenData.result.length === 0
      ) {
        console.debug("No ERC20 token transactions found for address:", address)
        const emptyResult: IActivityRow[] = []
        // Cache empty result with random TTL between 15-25 seconds
        const randomTtl = 15000 + Math.floor(Math.random() * 10000)
        await storageWithTtl.set(cacheKey, emptyResult, randomTtl)
        return emptyResult
      }

      let tokenList = await this.getService().getTokensList()

      let iconURLS: Map<string, string | undefined> = tokenList.reduce(
        (acc: Map<string, string | undefined>, token: ERC20TokenInfo) => {
          acc.set(token.address.toLowerCase(), token.logoURI)
          return acc
        },
        new Map<string, string | undefined>(),
      )

      // Process ERC20 token transactions
      const tokenActivities: IActivityRow[] = tokenData.result.map((tx) => {
        const isSent = tx.from.toLowerCase() === address.toLowerCase()
        const decimals = parseInt(tx.tokenDecimal || "18", 10)
        const amount = Number(tx.value) / 10 ** decimals

        return {
          id: `${tx.hash}`,
          action: isSent ? IActivityAction.SENT : IActivityAction.RECEIVED,
          timestamp: new Date(Number(tx.timeStamp) * 1000),
          asset: {
            type: "ft" as const,
            currency: tx.tokenSymbol,
            amount: amount,
            icon: iconURLS.get(tx.contractAddress.toLowerCase()),
            rate: 0,
            decimals: decimals,
            canister: tx.contractAddress.toLowerCase(),
          },
          from: tx.from,
          to: tx.to,
        }
      })

      console.debug("Processed ERC20 activities:", tokenActivities)

      // Cache result with random TTL between 15-25 seconds
      const randomTtl = 15000 + Math.floor(Math.random() * 10000)
      await storageWithTtl.set(cacheKey, tokenActivities, randomTtl)

      return tokenActivities
    } catch (error) {
      console.error(
        "Error fetching ERC20 token transactions from Etherscan:",
        error,
      )
      return []
    }
  }
}

export abstract class EVMNativeTransactionService
  implements EVMTransactionService
{
  protected getUrl(address: string): string {
    return `https://api.etherscan.io/v2/api?chainid=${this.getChainId()}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
  }
  public async getActivitiesRows(address: string): Promise<IActivityRow[]> {
    const chainId = this.getChainId()
    const normalizedAddress = address.toLowerCase()
    const cacheKey = `EVM_ACTIVITIES_${chainId}_${normalizedAddress}`

    // Check cache first
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    if (cache && !cache.expired) {
      return cache.value as IActivityRow[]
    }

    // If cache expired, return it immediately and refresh in background
    if (cache && cache.expired) {
      this.fetchAndCacheActivities(address, cacheKey).catch((error) => {
        console.error("Failed to refresh activities in background:", error)
      })
      return cache.value as IActivityRow[]
    }

    // No cache, fetch and cache
    return await this.fetchAndCacheActivities(address, cacheKey)
  }

  private async fetchAndCacheActivities(
    address: string,
    cacheKey: string,
  ): Promise<IActivityRow[]> {
    try {
      const url = this.getUrl(address)

      console.debug(
        "Fetching ETH transactions from Etherscan for address:",
        address,
      )
      const response = await fetch(url)
      const data: EtherscanResponse = await response.json()

      console.debug("Etherscan response:", data)

      if (data.status !== "1") {
        console.error("Etherscan API error:", data.message)
        const emptyResult: IActivityRow[] = []
        // Cache empty result with random TTL between 15-25 seconds
        const randomTtl = 15000 + Math.floor(Math.random() * 10000)
        await storageWithTtl.set(cacheKey, emptyResult, randomTtl)
        return emptyResult
      }

      if (!data.result || data.result.length === 0) {
        console.debug("No ETH transactions found for address:", address)
        const emptyResult: IActivityRow[] = []
        // Cache empty result with random TTL between 15-25 seconds
        const randomTtl = 15000 + Math.floor(Math.random() * 10000)
        await storageWithTtl.set(cacheKey, emptyResult, randomTtl)
        return emptyResult
      }

      const activities: IActivityRow[] = data.result.map((tx) => {
        const isSent = tx.from.toLowerCase() === address.toLowerCase()

        return {
          id: tx.hash,
          action: isSent ? IActivityAction.SENT : IActivityAction.RECEIVED,
          timestamp: new Date(Number(tx.timeStamp) * 1000), // Convert from seconds to milliseconds
          asset: {
            type: "ft",
            currency: this.getCurrency(),
            amount: Number(tx.value),
            icon: this.getIcon(),
            rate: 0,
            decimals: ETH_DECIMALS,
            canister: ETH_NATIVE_ID,
          },
          from: tx.from,
          to: tx.to,
        }
      })

      console.debug("Processed ETH activities:", activities)

      // Cache result with random TTL between 15-25 seconds
      const randomTtl = 15000 + Math.floor(Math.random() * 10000)
      await storageWithTtl.set(cacheKey, activities, randomTtl)

      return activities
    } catch (error) {
      console.error("Error fetching ETH transactions from Etherscan:", error)
      return []
    }
  }

  protected getApiKey(): string {
    return ETHERSCAN_API_KEY
  }

  protected abstract getChainId(): number
  protected abstract getCurrency(): string
  protected abstract getIcon(): string
  protected abstract getDecimals(): number
  protected abstract getCanister(): string
}
