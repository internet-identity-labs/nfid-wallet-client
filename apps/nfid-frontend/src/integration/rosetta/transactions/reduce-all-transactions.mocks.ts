import { TransactionHistory } from "../rosetta_interface"

export const principals = []

export const transactionsList = [
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  {
    totalCount: 1,
    transactions: [
      {
        blockIdentifier: {
          index: 4867790,
          hash: "60e3db67021c42597cd3b667bafe04e88dbadc7d974023c58ca7fd364c0716c1",
        },
        transaction: {
          metadata: {
            blockHeight: 4867790,
            memo: 0,
            timestamp: 1668621821682086100,
          },
          transactionIdentifier: {
            hash: "367de2e2d1850e67b24ba8f28d5f4a107c11a093e41c2dfe71b3cd72b02bffa5",
          },
          operations: [
            {
              operationIdentifier: { index: 0 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.001",
              },
            },
            {
              operationIdentifier: { index: 1 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "0ceb0a6219f2f8c531aaf4c0507299f3fb4271b18279ecbfe4fef6f34ad36d4e",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "0.001",
              },
            },
            {
              operationIdentifier: { index: 2 },
              type: "FEE",
              status: "COMPLETED",
              account: {
                address:
                  "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.0001",
              },
            },
          ],
        },
      },
    ],
  },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  { totalCount: 0, transactions: [] },
  {
    totalCount: 2,
    transactions: [
      {
        blockIdentifier: {
          index: 4867790,
          hash: "60e3db67021c42597cd3b667bafe04e88dbadc7d974023c58ca7fd364c0716c1",
        },
        transaction: {
          metadata: {
            blockHeight: 4867790,
            memo: 0,
            timestamp: 1668621821682086100,
          },
          transactionIdentifier: {
            hash: "367de2e2d1850e67b24ba8f28d5f4a107c11a093e41c2dfe71b3cd72b02bffa5",
          },
          operations: [
            {
              operationIdentifier: { index: 0 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.001",
              },
            },
            {
              operationIdentifier: { index: 1 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "0ceb0a6219f2f8c531aaf4c0507299f3fb4271b18279ecbfe4fef6f34ad36d4e",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "0.001",
              },
            },
            {
              operationIdentifier: { index: 2 },
              type: "FEE",
              status: "COMPLETED",
              account: {
                address:
                  "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.0001",
              },
            },
          ],
        },
      },
      {
        blockIdentifier: {
          index: 4867684,
          hash: "2425083d127d390af0de2749f7b48f0d729e1a8239d106c89d3f911975391fde",
        },
        transaction: {
          metadata: {
            blockHeight: 4867684,
            memo: 0,
            timestamp: 1668619611656870100,
          },
          transactionIdentifier: {
            hash: "8b07396b208a469ae9162db3b777d24e13f0da173861a3adb096e714f34d2657",
          },
          operations: [
            {
              operationIdentifier: { index: 0 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "5b1b92ea90b3936d67a8c8d9aa842ad652d5e4916dae0d747b6d021e049e7a8e",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.01",
              },
            },
            {
              operationIdentifier: { index: 1 },
              type: "TRANSACTION",
              status: "COMPLETED",
              account: {
                address:
                  "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "0.01",
              },
            },
            {
              operationIdentifier: { index: 2 },
              type: "FEE",
              status: "COMPLETED",
              account: {
                address:
                  "5b1b92ea90b3936d67a8c8d9aa842ad652d5e4916dae0d747b6d021e049e7a8e",
              },
              amount: {
                currency: { symbol: "ICP", decimals: 8 },
                value: "-0.0001",
              },
            },
          ],
        },
      },
    ],
  },
]

export const REDUCED_TRANSACTIONS = {
  totalCount: 2,
  transactions: [
    {
      blockIdentifier: {
        index: 4867790,
        hash: "60e3db67021c42597cd3b667bafe04e88dbadc7d974023c58ca7fd364c0716c1",
      },
      transaction: {
        metadata: {
          blockHeight: 4867790,
          memo: 0,
          timestamp: 1668621821682086100,
        },
        transactionIdentifier: {
          hash: "367de2e2d1850e67b24ba8f28d5f4a107c11a093e41c2dfe71b3cd72b02bffa5",
        },
        operations: [
          {
            operationIdentifier: { index: 0 },
            type: "TRANSACTION",
            status: "COMPLETED",
            account: {
              address:
                "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "-0.001",
            },
          },
          {
            operationIdentifier: { index: 1 },
            type: "TRANSACTION",
            status: "COMPLETED",
            account: {
              address:
                "0ceb0a6219f2f8c531aaf4c0507299f3fb4271b18279ecbfe4fef6f34ad36d4e",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "0.001",
            },
          },
          {
            operationIdentifier: { index: 2 },
            type: "FEE",
            status: "COMPLETED",
            account: {
              address:
                "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "-0.0001",
            },
          },
        ],
      },
    },
    {
      blockIdentifier: {
        index: 4867684,
        hash: "2425083d127d390af0de2749f7b48f0d729e1a8239d106c89d3f911975391fde",
      },
      transaction: {
        metadata: {
          blockHeight: 4867684,
          memo: 0,
          timestamp: 1668619611656870100,
        },
        transactionIdentifier: {
          hash: "8b07396b208a469ae9162db3b777d24e13f0da173861a3adb096e714f34d2657",
        },
        operations: [
          {
            operationIdentifier: { index: 0 },
            type: "TRANSACTION",
            status: "COMPLETED",
            account: {
              address:
                "5b1b92ea90b3936d67a8c8d9aa842ad652d5e4916dae0d747b6d021e049e7a8e",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "-0.01",
            },
          },
          {
            operationIdentifier: { index: 1 },
            type: "TRANSACTION",
            status: "COMPLETED",
            account: {
              address:
                "0e9d2be256d0e3ecde013f33c91298b3c0b118f93760b8fb9527525bf7b3e2ac",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "0.01",
            },
          },
          {
            operationIdentifier: { index: 2 },
            type: "FEE",
            status: "COMPLETED",
            account: {
              address:
                "5b1b92ea90b3936d67a8c8d9aa842ad652d5e4916dae0d747b6d021e049e7a8e",
            },
            amount: {
              currency: { symbol: "ICP", decimals: 8 },
              value: "-0.0001",
            },
          },
        ],
      },
    },
  ],
} as TransactionHistory
