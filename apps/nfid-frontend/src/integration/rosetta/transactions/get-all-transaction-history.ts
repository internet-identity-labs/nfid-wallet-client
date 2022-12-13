import { Principal } from "@dfinity/principal"

import { TransactionHistory } from "frontend/integration/rosetta/rosetta_interface"

import { getTransactionHistory } from "."
import { reduceAllTransactions } from "./reduce-all-transactions"

export async function getAllTransactionHistory(
  principals: Principal[],
): Promise<TransactionHistory> {
  return reduceAllTransactions(
    await Promise.all(principals.map(getTransactionHistory)),
  )
}
