import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export type AddTentativeDeviceResponse =
  | {
      device_registration_mode_off: null
    }
  | { another_device_tentatively_added: null }
  | {
      added_tentatively: {
        verification_code: string
        device_registration_timeout: Timestamp
      }
    }
export interface Challenge {
  png_base64: string
  challenge_key: ChallengeKey
}
export type ChallengeKey = string
export interface ChallengeResult {
  key: ChallengeKey
  chars: string
}
export type CredentialId = Array<number>
export interface Delegation {
  pubkey: PublicKey
  targets: [] | [Array<Principal>]
  expiration: Timestamp
}
export interface DeviceData {
  alias: string
  protection: DeviceProtection
  pubkey: DeviceKey
  key_type: KeyType
  purpose: Purpose
  credential_id: [] | [CredentialId]
}
export type DeviceKey = PublicKey
export type DeviceProtection = { unprotected: null } | { protected: null }
export interface DeviceRegistrationInfo {
  tentative_device: [] | [DeviceData]
  expiration: Timestamp
}
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
export interface IdentityAnchorInfo {
  devices: Array<DeviceData>
  device_registration: [] | [DeviceRegistrationInfo]
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
export type PublicKey = Array<number>
export type Purpose = { authentication: null } | { recovery: null }
export type RegisterResponse =
  | { bad_challenge: null }
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
export type UserKey = PublicKey
export type UserNumber = bigint
export type VerifyTentativeDeviceResponse =
  | {
      device_registration_mode_off: null
    }
  | { verified: null }
  | { wrong_code: { retries_left: number } }
  | { no_device_to_verify: null }
export interface _SERVICE {
  add: ActorMethod<[UserNumber, DeviceData], undefined>
  add_tentative_device: ActorMethod<
    [UserNumber, DeviceData],
    AddTentativeDeviceResponse
  >
  create_challenge: ActorMethod<[], Challenge>
  enter_device_registration_mode: ActorMethod<[UserNumber], Timestamp>
  exit_device_registration_mode: ActorMethod<[UserNumber], undefined>
  get_anchor_info: ActorMethod<[UserNumber], IdentityAnchorInfo>
  get_delegation: ActorMethod<
    [UserNumber, FrontendHostname, SessionKey, Timestamp],
    GetDelegationResponse
  >
  get_principal: ActorMethod<[UserNumber, FrontendHostname], Principal>
  http_request: ActorMethod<[HttpRequest], HttpResponse>
  init_salt: ActorMethod<[], undefined>
  lookup: ActorMethod<[UserNumber], Array<DeviceData>>
  prepare_delegation: ActorMethod<
    [UserNumber, FrontendHostname, SessionKey, [] | [bigint]],
    [UserKey, Timestamp]
  >
  register: ActorMethod<[DeviceData, ChallengeResult], RegisterResponse>
  remove: ActorMethod<[UserNumber, DeviceKey], undefined>
  stats: ActorMethod<[], InternetIdentityStats>
  update: ActorMethod<[UserNumber, DeviceKey, DeviceData], undefined>
  verify_tentative_device: ActorMethod<
    [UserNumber, string],
    VerifyTentativeDeviceResponse
  >,
  add_email_and_principal_for_create_account_validation : ActorMethod<
  [string, string, number],
  BoolHttpResponse
  >
}
