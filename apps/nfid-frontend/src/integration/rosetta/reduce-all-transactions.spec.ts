/**
 * @jest-environment jsdom
 */
import { reduceAllTransactions } from "./reduce-all-transactions"
import {
  reducedTransactions,
  transactionsList,
} from "./reduce-all-transactions.mocks"
import { TransactionHistory } from "./rosetta_interface"

describe("reduceAllTransactions", () => {
  it("should flatten list of TransactionHistory", () => {
    expect(
      reduceAllTransactions(transactionsList as TransactionHistory[]),
    ).toEqual(reducedTransactions)
  })
})
