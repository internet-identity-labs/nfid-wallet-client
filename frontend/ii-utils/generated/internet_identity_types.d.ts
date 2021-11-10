import type { Principal } from "@dfinity/principal"
export type CredentialId = Array<number>
export interface Delegation {
  pubkey: PublicKey
  targets: [] | [Array<Principal>]
  expiration: Timestamp
}
export type DelegationJson = string
export interface DelegationJsonResponse {
  delegation: [] | [DelegationJson]
  status_code: number
}
export type DelegationKey = string
export interface DeviceData {
  alias: string
  pubkey: DeviceKey
  key_type: KeyType
  purpose: Purpose
  credential_id: [] | [CredentialId]
}
export type DeviceKey = PublicKey
export type FrontendHostname = string
export type GetDelegationResponse =
  | { no_such_delegation: null }
  | { signed_delegation: SignedDelegation }
export type HeaderField = [string, string]
export interface HttpRequest {
  url: string
  method: string
  body: Array<number>
  headers: Array<HeaderField>
}
export interface HttpResponse {
  body: Array<number>
  headers: Array<HeaderField>
  streaming_strategy: [] | [StreamingStrategy]
  status_code: number
}
export interface InternetIdentityInit {
  assigned_user_number_range: [bigint, bigint]
}
export interface InternetIdentityStats {
  users_registered: bigint
  assigned_user_number_range: [bigint, bigint]
}
export type KeyType =
  | { platform: null }
  | { seed_phrase: null }
  | { cross_platform: null }
  | { unknown: null }
export type Message = string
export interface ProofOfWork {
  nonce: bigint
  timestamp: Timestamp
}
export type PublicKey = Array<number>
export type Purpose = { authentication: null } | { recovery: null }
export type RegisterResponse =
  | { canister_full: null }
  | { registered: { user_number: UserNumber } }
export type SessionKey = PublicKey
export interface SignedDelegation {
  signature: Array<number>
  delegation: Delegation
}
export interface StreamingCallbackHttpResponse {
  token: [] | [Token]
  body: Array<number>
}
export type StreamingStrategy = {
  Callback: { token: Token; callback: [Principal, string] }
}
export type Timestamp = bigint
export type Token = {}
export type Topic = string
export type UserKey = PublicKey
export type UserNumber = bigint
export interface _SERVICE {
  add: (arg_0: UserNumber, arg_1: DeviceData) => Promise<undefined>
  get_delegate: (arg_0: DelegationKey) => Promise<DelegationJsonResponse>
  get_delegation: (
    arg_0: UserNumber,
    arg_1: FrontendHostname,
    arg_2: SessionKey,
    arg_3: Timestamp,
  ) => Promise<GetDelegationResponse>
  get_messages: (arg_0: Topic) => Promise<Array<Message>>
  get_principal: (
    arg_0: UserNumber,
    arg_1: FrontendHostname,
  ) => Promise<Principal>
  init_salt: () => Promise<undefined>
  lookup: (arg_0: UserNumber) => Promise<Array<DeviceData>>
  post_messages: (arg_0: Topic, arg_1: Array<Message>) => Promise<undefined>
  prepare_delegation: (
    arg_0: UserNumber,
    arg_1: FrontendHostname,
    arg_2: SessionKey,
    arg_3: [] | [bigint],
  ) => Promise<[UserKey, Timestamp]>
  put_delegate: (
    arg_0: DelegationKey,
    arg_1: DelegationJson,
  ) => Promise<DelegationJsonResponse>
  register: (arg_0: DeviceData, arg_1: ProofOfWork) => Promise<RegisterResponse>
  remove: (arg_0: UserNumber, arg_1: DeviceKey) => Promise<undefined>
  stats: () => Promise<InternetIdentityStats>
}
