/**
 * @jest-environment jsdom
 */
import { TransactionHistory } from "../rosetta_interface"
import { reduceAllTransactions } from "./reduce-all-transactions"
import {
  REDUCED_TRANSACTIONS,
  transactionsList,
} from "./reduce-all-transactions.mocks"

describe("reduceAllTransactions", () => {
  it("should flatten list of TransactionHistory", () => {
    expect(
      reduceAllTransactions(transactionsList as TransactionHistory[]),
    ).toEqual(REDUCED_TRANSACTIONS)
  })
})
