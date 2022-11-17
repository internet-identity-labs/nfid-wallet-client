import { reducedTransactions } from "./reduce-all-transactions.mocks"
import {
  selectReceivedTransactions,
  selectSendTransactions,
} from "./select-transactions"
import { ACCOUNTS } from "./select-transactions.mocks"

describe("selectTransactions", () => {
  it("should return send transactions", () => {
    expect(
      selectSendTransactions({
        transactions: reducedTransactions,
        accounts: ACCOUNTS,
      }),
    ).toEqual([
      {
        type: "send",
        asset: "ICP",
        date: expect.any(String),
        from: "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
        quantity: 0.001,
        to: "0ceb0a6219f2f8c531aaf4c0507299f3fb4271b18279ecbfe4fef6f34ad36d4e",
      },
    ])
  })
  it("should return received transactions", () => {
    expect(
      selectReceivedTransactions({
        transactions: reducedTransactions,
        accounts: ACCOUNTS,
      }),
    ).toEqual([
      {
        type: "received",
        asset: "ICP",
        date: expect.any(String),
        from: "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
        quantity: 0.001,
        to: "0ceb0a6219f2f8c531aaf4c0507299f3fb4271b18279ecbfe4fef6f34ad36d4e",
      },
      {
        type: "received",
        asset: "ICP",
        date: expect.any(String),
        from: "5b1b92ea90b3936d67a8c8d9aa842ad652d5e4916dae0d747b6d021e049e7a8e",
        quantity: 0.01,
        to: "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
      },
    ])
  })
})
