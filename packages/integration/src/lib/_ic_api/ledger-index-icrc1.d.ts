import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Account {
  owner: Principal
  subaccount: [] | [Uint8Array | number[]]
}
export interface GetAccountIdentifierTransactionsArgs {
  max_results: bigint
  start: [] | [bigint]
  account_identifier: string
}
export interface GetAccountIdentifierTransactionsError {
  message: string
}
export interface GetAccountIdentifierTransactionsResponse {
  balance: bigint
  transactions: Array<TransactionWithId>
  oldest_tx_id: [] | [bigint]
}
export type GetAccountIdentifierTransactionsResult =
  | {
      Ok: GetAccountIdentifierTransactionsResponse
    }
  | { Err: GetAccountIdentifierTransactionsError }
export interface GetAccountTransactionsArgs {
  max_results: bigint
  start: [] | [bigint]
  account: Account
}
export interface GetBlocksRequest {
  start: bigint
  length: bigint
}
export interface GetBlocksResponse {
  blocks: Array<Uint8Array | number[]>
  chain_length: bigint
}
export interface HttpRequest {
  url: string
  method: string
  body: Uint8Array | number[]
  headers: Array<[string, string]>
}
export interface HttpResponse {
  body: Uint8Array | number[]
  headers: Array<[string, string]>
  status_code: number
}
export interface InitArg {
  ledger_id: Principal
}
export type Operation =
  | {
      Approve: {
        fee: Tokens
        from: string
        allowance: Tokens
        expires_at: [] | [TimeStamp]
        spender: string
      }
    }
  | { Burn: { from: string; amount: Tokens } }
  | { Mint: { to: string; amount: Tokens } }
  | {
      Transfer: {
        to: string
        fee: Tokens
        from: string
        amount: Tokens
      }
    }
  | {
      TransferFrom: {
        to: string
        fee: Tokens
        from: string
        amount: Tokens
        spender: string
      }
    }
export interface Status {
  num_blocks_synced: bigint
}
export interface TimeStamp {
  timestamp_nanos: bigint
}
export interface Tokens {
  e8s: bigint
}
export interface Transaction {
  memo: bigint
  icrc1_memo: [] | [Uint8Array | number[]]
  operation: Operation
  created_at_time: [] | [TimeStamp]
  timestamp: [] | [TimeStamp]
}
export interface TransactionWithId {
  id: bigint
  transaction: Transaction
}
export interface _SERVICE {
  get_account_identifier_balance: ActorMethod<[string], bigint>
  get_account_identifier_transactions: ActorMethod<
    [GetAccountIdentifierTransactionsArgs],
    GetAccountIdentifierTransactionsResult
  >
  get_account_transactions: ActorMethod<
    [
      {
        max_results: bigint
        start: [] | [bigint]
        account: {
          owner: Principal
          subaccount: [] | [Uint8Array | number[]]
        }
      },
    ],
    | {
        Ok: {
          balance: bigint
          transactions: Array<{
            id: bigint
            transaction: {
              memo: bigint
              icrc1_memo: [] | [Uint8Array | number[]]
              operation:
                | {
                    Approve: {
                      fee: { e8s: bigint }
                      from: string
                      allowance: { e8s: bigint }
                      expected_allowance: [] | [{ e8s: bigint }]
                      expires_at: [] | [{ timestamp_nanos: bigint }]
                      spender: string
                    }
                  }
                | {
                    Burn: {
                      from: string
                      amount: { e8s: bigint }
                      spender: [] | [string]
                    }
                  }
                | {
                    Mint: { to: string; amount: { e8s: bigint } }
                  }
                | {
                    Transfer: {
                      to: string
                      fee: { e8s: bigint }
                      from: string
                      amount: { e8s: bigint }
                      spender: [] | [string]
                    }
                  }
              timestamp: [] | [{ timestamp_nanos: bigint }]
              created_at_time: [] | [{ timestamp_nanos: bigint }]
            }
          }>
          oldest_tx_id: [] | [bigint]
        }
      }
    | { Err: { message: string } }
  >
  get_blocks: ActorMethod<[GetBlocksRequest], GetBlocksResponse>
  http_request: ActorMethod<[HttpRequest], HttpResponse>
  icrc1_balance_of: ActorMethod<[Account], bigint>
  ledger_id: ActorMethod<[], Principal>
  status: ActorMethod<[], Status>
}
