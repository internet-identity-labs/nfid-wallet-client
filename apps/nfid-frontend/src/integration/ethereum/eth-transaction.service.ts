import { ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"

const ETHERSCAN_API_KEY = "861Q6D7WDJD35UMUU3NQ6R798IFQ211TU5"

interface EtherscanTransaction {
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

interface EtherscanResponse {
  status: string
  message: string
  result: EtherscanTransaction[]
}

export const getEthActivitiesRows = async (
  address: string,
): Promise<IActivityRow[]> => {
  try {
    //TODO change to ETH after testing
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    //const url = `https://etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`

    console.debug(
      "Fetching ETH transactions from Etherscan for address:",
      address,
    )
    const response = await fetch(url)
    const data: EtherscanResponse = await response.json()

    console.debug("Etherscan response:", data)

    if (data.status !== "1") {
      console.error("Etherscan API error:", data.message)
      return []
    }

    if (!data.result || data.result.length === 0) {
      console.debug("No ETH transactions found for address:", address)
      return []
    }

    const activities: IActivityRow[] = data.result.map((tx) => {
      const isSent = tx.from.toLowerCase() === address.toLowerCase()

      return {
        id: tx.hash,
        action: isSent ? IActivityAction.SENT : IActivityAction.RECEIVED,
        timestamp: new Date(Number(tx.timeStamp) * 1000), // Convert from seconds to milliseconds
        asset: {
          type: "ft",
          currency: "ETH",
          amount: Number(tx.value),
          icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
          rate: 0,
          decimals: 18,
          canister: ETH_NATIVE_ID,
        },
        from: tx.from,
        to: tx.to,
      }
    })

    console.debug("Processed ETH activities:", activities)
    return activities
  } catch (error) {
    console.error("Error fetching ETH transactions from Etherscan:", error)
    return []
  }
}
