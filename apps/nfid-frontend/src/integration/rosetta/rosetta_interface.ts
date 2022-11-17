export interface RosettaBalance {
  block_identifier: {
    index: number
    hash: string
  }
  balances: [Balance]
  metadata: {
    sequence_number: number
  }
}

export interface Balance {
  value: string
  currency: {
    symbol: string
    decimals: number
    metadata: {
      Issuer: string
    }
  }
  metadata: object
}

export interface XdrUsd {
  XDR_USD: string
}

export interface TransactionHistoryResponse {
  transactions: [
    {
      block_identifier: {
        index: number
        hash: string
      }
      transaction: {
        transaction_identifier: {
          hash: string
        }
        operations: [
          {
            operation_identifier: {
              index: number
            }
            type: string
            status: string
            account: {
              address: string
            }
            amount: {
              value: string
              currency: {
                symbol: string
                decimals: number
              }
            }
          },
          {
            operation_identifier: {
              index: number
            }
            type: string
            status: string
            account: {
              address: string
            }
            amount: {
              value: string
              currency: {
                symbol: string
                decimals: number
              }
            }
          },
          {
            operation_identifier: {
              index: number
            }
            type: string
            status: string
            account: {
              address: string
            }
            amount: {
              value: string
              currency: {
                symbol: string
                decimals: number
              }
            }
          },
        ]
        metadata: {
          block_height: number
          memo: number
          timestamp: number
        }
      }
    },
  ]
  total_count: number
}

export interface Operation {
  operationIdentifier: {
    index: number
  }
  type: string
  status: string
  account: {
    address: string
  }
  amount: {
    value: string
    currency: {
      symbol: string
      decimals: number
    }
  }
}

type Sender = Operation
type Receiver = Operation
type Fee = Operation

export interface Transaction {
  blockIdentifier: {
    index: number
    hash: string
  }
  transaction: {
    transactionIdentifier: {
      hash: string
    }
    operations: [Sender, Receiver, Fee]
    metadata: {
      blockHeight: number
      memo: number
      timestamp: number
    }
  }
}

export interface TransactionHistory {
  transactions: Transaction[]
  totalCount: number
}
