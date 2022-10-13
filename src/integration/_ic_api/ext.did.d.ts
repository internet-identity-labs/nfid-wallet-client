import {Principal} from "@dfinity/principal"

type Balance = number
type AccountIdentifier = string
type TokenIdentifier = string

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

export type CommonError =
  | { InvalidToken: AccountIdentifier }
  | { Other: string }

export type LockResult =
  | { ok: AccountIdentifier }
  | { err: CommonError }


export type ListRequest = {
  token: TokenIdentifier,
  from_subaccount: [SubAccount],
  price: [BigInt]
};

export type ListResult =
  | { ok: null }
  | { err: CommonError }

export type SettleResult =
  | { ok: null }
  | { err: CommonError }


export interface _SERVICE {
  transfer: (TransferRequest) => Promise<TransferResult>
  lock: (TokenIdentifier, number, AccountIdentifier, SubAccount) => Promise<LockResult>
  list: (ListRequest) => Promise<ListResult>,
  settle: (string) => Promise<SettleResult>,
}
