import { Principal } from "@dfinity/principal"

type Balance = number

export type User = { address: string } | { principal: Principal }
export type Memo = Array<number>

export type SubAccount = Array<number>

export type TransferRequest = {
  to: User
  token: string
  notify: boolean
  from: User
  memo: Memo
  subaccount: [] | [SubAccount]
  amount: Balance
}

export type TransferResult =
  | { ok: Balance }
  | {
      err:
        | { CannotNotify: string }
        | { InsufficientBalance: null }
        | { InvalidToken: string }
        | { Rejected: null }
        | { Unauthorized: string }
        | { Other: string }
    }

export interface _SERVICE {
  transfer: (TransferRequest) => Promise<TransferResult>
}
