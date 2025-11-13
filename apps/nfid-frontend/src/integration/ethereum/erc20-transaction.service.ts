import { ETHERSCAN_API_KEY } from "@nfid/integration/token/constants"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"
import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"
import { erc20Service } from "./erc20.service"

interface EtherscanTokenTransaction {
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

interface EtherscanTokenResponse {
  status: string
  message: string
  result: EtherscanTokenTransaction[]
}

/**
 * Get ERC20 token transactions for an address
 * Uses Etherscan API to fetch token transfer transactions
 *
 * @param address - Wallet address to get transactions for
 * @param chainId - Chain ID (1 for mainnet, 11155111 for Sepolia)
 * @returns Array of activity rows for ERC20 token transactions
 */
export const getErc20ActivitiesRows = async (
  address: string,
  chainId: number = 1,
): Promise<IActivityRow[]> => {
  try {
    // Get ERC20 token transactions
    const tokenUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`

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
      return []
    }

    let tokenList = await erc20Service.getKnownTokensList()

    let iconURLS: Map<string, string | undefined> = tokenList.reduce(
      (acc, token) => {
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
    return tokenActivities
  } catch (error) {
    console.error(
      "Error fetching ERC20 token transactions from Etherscan:",
      error,
    )
    return []
  }
}
