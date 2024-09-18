import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface AllowanceRequest {
  token: string
  owner: User
  spender: Principal
}
export interface ApproveRequest {
  token: string
  subaccount: [] | [Array<number>]
  allowance: number
  spender: Principal
}
export interface BalanceRequest {
  token: string
  user: User
}
export interface ClaimRequest {
  to: User
  index: number
}
export type CommonError = { InvalidToken: string } | { Other: string }
export interface Info {
  reserve: number
  claimed: number
  available: number
  supply: number
}
export type Metadata =
  | {
      fungible: {
        decimals: number
        metadata: [] | [Array<number>]
        name: string
        symbol: string
      }
    }
  | { nonfungible: { metadata: [] | [Array<number>] } }
export interface MintRequest {
  to: User
  metadata: [] | [Array<number>]
}
export type Result = { Ok: number } | { Err: CommonError }
export type Result_1 = { Ok: string } | { Err: CommonError }
export type Result_2 = { Ok: Metadata } | { Err: CommonError }
export type Result_3 = { Ok: Array<number> } | { Err: CommonError }
export type Result_4 = { Ok: number } | { Err: TransferError }
export type TransferError =
  | { CannotNotify: string }
  | { InsufficientBalance: number }
  | { InvalidToken: string }
  | { Rejected: null }
  | { Unauthorized: string }
  | { Other: string }
export interface TransferRequest {
  to: User
  token: string
  from: User
  memo: Array<number>
  subaccount: [] | [Array<number>]
  amount: number
}
export type User = { principal: Principal } | { address: string }
export interface _SERVICE {
  account_id: ActorMethod<[Principal], string>
  add_manager: ActorMethod<[Principal], bigint>
  allowance: ActorMethod<[AllowanceRequest], Result>
  approve: ActorMethod<[ApproveRequest], boolean>
  approveAll: ActorMethod<[Array<ApproveRequest>], Array<number>>
  balance: ActorMethod<[BalanceRequest], Result>
  batchMintNFT: ActorMethod<[Array<MintRequest>], Array<number>>
  bearer: ActorMethod<[string], Result_1>
  claimNFT: ActorMethod<[MintRequest], number>
  claim_count: ActorMethod<[], Result>
  claim_supply: ActorMethod<[], Result>
  extensions: ActorMethod<[], Array<string>>
  force_claim_reserve: ActorMethod<[ClaimRequest], number>
  getAllowances: ActorMethod<[], Array<[number, Principal]>>
  getMinter: ActorMethod<[], Principal>
  getRegistry: ActorMethod<[], Array<[number, string]>>
  getTokens: ActorMethod<[], Array<[number, Metadata]>>
  getTokensByIds: ActorMethod<[Array<number>], Array<[number, Metadata]>>
  init_reserve: ActorMethod<[number], undefined>
  is_manager: ActorMethod<[Principal], boolean>
  metadata: ActorMethod<[string], Result_2>
  mintNFT: ActorMethod<[MintRequest], number>
  pop_info: ActorMethod<[], Info>
  reserve_tokens: ActorMethod<[], Array<number>>
  setMinter: ActorMethod<[Principal], undefined>
  set_claim_supply: ActorMethod<[number], undefined>
  supply: ActorMethod<[string], Result>
  test: ActorMethod<[], User>
  token_id: ActorMethod<[number], string>
  tokens: ActorMethod<[string], Result_3>
  transfer: ActorMethod<[TransferRequest], Result_4>
}
