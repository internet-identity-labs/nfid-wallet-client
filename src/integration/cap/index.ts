import { CapRoot, CapRouter, prettifyCapTransactions } from "@psychedelic/cap-js"
import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { encodeTokenIdentifier, principalToAddress } from "ictool"
import { getCapRoot } from "frontend/integration/cap/cap_util"


export async function getTokenTransactionHistory(
  canisterId: string, page: number,
): Promise<TransactionPrettified[]> {
  let capRoot = await getCapRoot(canisterId)
  return await capRoot.get_transactions({ page })
    .then((l) => l.data.map((event: any) => prettifyCapTransactions(event)))
}

export async function getUserTransactions(
  canisterId: string, user: Principal, from: number, to: number,
): Promise<TransactionPrettified[]> {
  let address = principalToAddress(user as any)
  let transactions: TransactionPrettified[] = []
  while (transactions.length < (from - to)) {
    let transactions = await getTokenTransactionHistory(canisterId, from)
    let filtered = transactions.filter((l) => l.from === address || l.to === address)
    transactions = transactions.concat(filtered)
    from++
  }
  return transactions
}

export async function getTokenTxHistoryOfTokenIndex(
  canisterId: string, tokenId: number, from: number, to: number,
) {
  const encodedTokenId = encodeTokenIdentifier(canisterId, tokenId)
  let transactions: TransactionPrettified[] = []
  while (transactions.length < (to - from)) {
    console.log(111)
    let transactions = await getTokenTransactionHistory(canisterId, from)
    console.log(transactions)
    let filtered = transactions.filter((l) => l.details.token === encodedTokenId)
    transactions = transactions.concat(filtered)
    from++
  }
  return transactions
}
