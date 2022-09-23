import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { encodeTokenIdentifier, principalToAddress } from "ictool"

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
 * @param tokenId
 * @param from
 * @param to
 */
export async function getUserTransactions(
  canisterId: string,
  user: Principal,
  from: number,
  to: number,
): Promise<[TransactionPrettified[], boolean]> {
  let address = principalToAddress(user as any)
  let transactions: TransactionPrettified[] = []
  while (from < to) {
    let transactionHistory = await getTokenTransactionHistory(canisterId, from)
    if (transactionHistory.length === 0) return [transactions, true]
    let filtered = transactionHistory.filter(
      (l) => l.details.from === address || l.details.to === address,
    )
    transactions = transactions.concat(filtered)
    from++
  }
  return [transactions, false]
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
  tokenId: number,
  from: number,
  to: number,
): Promise<[TransactionPrettified[], boolean]> {
  const encodedTokenId = encodeTokenIdentifier(canisterId, tokenId)
  let transactions: TransactionPrettified[] = []
  while (from < to) {
    let transactionHistory = await getTokenTransactionHistory(canisterId, from)
    if (transactionHistory.length === 0) {
      return [transactions, true]
    }
    let filtered = transactionHistory.filter(
      (l) => l.details.token === encodedTokenId,
    )
    transactions = transactions.concat(filtered)
    from++
  }
  return [transactions, false]
}
