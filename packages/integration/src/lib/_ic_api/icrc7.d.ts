import type { ActorMethod } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import type { Principal } from "@icp-sdk/core/principal"

export type Value =
  | { Int: bigint }
  | { Map: Array<[string, Value]> }
  | { Nat: bigint }
  | { Blob: Uint8Array | number[] }
  | { Text: string }
  | { Array: Array<Value> }
export interface Account {
  owner: Principal
  subaccount: [] | [Uint8Array | number[]]
}
export interface ApprovalInfo {
  memo: [] | [Uint8Array | number[]]
  from_subaccount: [] | [Uint8Array | number[]]
  created_at_time: bigint
  expires_at: [] | [bigint]
  spender: Account
}
export interface ApproveTokenArg {
  token_id: bigint
  approval_info: ApprovalInfo
}
export interface RevokeTokenApprovalArg {
  token_id: bigint
  memo: [] | [Uint8Array | number[]]
  from_subaccount: [] | [Uint8Array | number[]]
  created_at_time: [] | [bigint]
  spender: [] | [Account]
}
export interface IsApprovedArg {
  token_id: bigint
  from_subaccount: [] | [Uint8Array | number[]]
  spender: Account
}
export interface _SERVICE {
  icrc7_name: ActorMethod<[], string>
  icrc7_symbol: ActorMethod<[], string>
  icrc7_description: ActorMethod<[], [] | [string]>
  icrc7_logo: ActorMethod<[], [] | [string]>
  icrc7_owner_of: ActorMethod<[Array<bigint>], Array<[] | [Account]>>
  icrc7_tokens_of: ActorMethod<
    [Account, [] | [bigint], [] | [bigint]],
    Array<bigint>
  >
  icrc7_token_metadata: ActorMethod<
    [Array<bigint>],
    Array<[] | [Array<[string, Value]>]>
  >
  icrc37_is_approved: ActorMethod<[Array<IsApprovedArg>], Array<boolean>>
  icrc37_approve_tokens: ActorMethod<[Array<ApproveTokenArg>], unknown>
  icrc37_revoke_token_approvals: ActorMethod<
    [Array<RevokeTokenApprovalArg>],
    unknown
  >
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
