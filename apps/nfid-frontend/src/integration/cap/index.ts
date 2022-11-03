import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { principalToAddress } from "ictool"

import { getCapRootTransactions } from "frontend/integration/cap/cap_util"

export async function getTokenTransactionHistory(
  canisterId: string,
  page: number,
): Promise<TransactionPrettified[]> {
  return await getCapRootTransactions(canisterId, page)
}

/**
 * Function to retrieve transaction history of the principal. Returns array
 * of transactions and isLastPage boolean
 * @param canisterId
 * @param user
 * @param from
 * @param to
 */
export async function getUserTransactions(
  canisterId: string,
  user: Principal,
  from: number,
  to: number,
): Promise<{ txHistory: TransactionPrettified[]; isLastPage: boolean }> {
  let address = principalToAddress(user as any)
  let transactionHistory = await Promise.all(
    [...Array(to).keys()].slice(from, to).map(async (page) => {
      let allHistory = await getCapRootTransactions(canisterId, page)
      let txHistory = allHistory.filter(
        (l) => l.details.from === address || l.details.to === address,
      )
      return { txHistory, isLastPage: allHistory.length === 0 }
    }),
  )
  return transactionHistory.reduce((x, y) => {
    return {
      txHistory: x.txHistory.concat(y.txHistory),
      isLastPage: x.isLastPage || y.isLastPage,
    }
  })
}

/**
 * Function to retrieve transaction history of the token. Returns array
 * of transactions and isLastPage boolean
 * @param canisterId
 * @param tokenId
 * @param from
 * @param to
 */
export async function getTokenTxHistoryOfTokenIndex(
  canisterId: string,
  tokenId: string,
  from: number,
  to: number,
): Promise<{ txHistory: TransactionPrettified[]; isLastPage: boolean }> {
  let transactionHistory = await Promise.all(
    [...Array(to).keys()].slice(from, to).map(async (page) => {
      let allHistory = await getCapRootTransactions(canisterId, page)
      let txHistory = allHistory.filter((l) => l.details.token === tokenId)
      return { txHistory, isLastPage: allHistory.length === 0 }
    }),
  )
  return transactionHistory.reduce((x, y) => {
    return {
      txHistory: x.txHistory.concat(y.txHistory),
      isLastPage: x.isLastPage || y.isLastPage,
    }
  })
}
