import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface AccessPointRemoveRequest {
  pub_key: string
}
export interface ChallengeAttempt {
  chars: [] | [string]
  challenge_key: string
}
export interface AccessPointRequest {
  icon: string
  device_type: DeviceType
  device: string
  pub_key: string
  browser: string
  credential_id: [] | [string]
}
export interface AccessPointResponse {
  icon: string
  device_type: DeviceType
  device: string
  browser: string
  last_used: bigint
  principal_id: string
  credential_id: [] | [string]
}
export interface Account {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPointRequest>
  email: [] | [string]
  basic_entity: BasicEntity
  personas: Array<PersonaResponse>
  wallet: WalletVariant
  principal_id: string
  phone_number: [] | [string]
}
export interface AccountResponse {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPointResponse>
  email: [] | [string]
  personas: Array<PersonaResponse>
  is2fa_enabled: boolean
  wallet: WalletVariant
  principal_id: string
  phone_number: [] | [string]
}
export interface Application {
  img: [] | [string]
  alias: [] | [Array<string>]
  user_limit: number
  domain: string
  name: string
  is_nft_storage: [] | [boolean]
  is_trusted: [] | [boolean]
  is_iframe_allowed: [] | [boolean]
}
export interface BasicEntity {
  modified_date: bigint
  created_date: bigint
}
export interface BoolHttpResponse {
  data: [] | [boolean]
  error: [] | [Error]
  status_code: number
}
export type CanisterCyclesAggregatedData = BigUint64Array | bigint[]
export type CanisterHeapMemoryAggregatedData = BigUint64Array | bigint[]
export type CanisterLogFeature =
  | { filterMessageByContains: null }
  | { filterMessageByRegex: null }
export interface CanisterLogMessages {
  data: Array<LogMessagesData>
  lastAnalyzedMessageTimeNanos: [] | [Nanos]
}
export interface CanisterLogMessagesInfo {
  features: Array<[] | [CanisterLogFeature]>
  lastTimeNanos: [] | [Nanos]
  count: number
  firstTimeNanos: [] | [Nanos]
}
export type CanisterLogRequest =
  | { getMessagesInfo: null }
  | { getMessages: GetLogMessagesParameters }
  | { getLatestMessages: GetLatestLogMessagesParameters }
export type CanisterLogResponse =
  | { messagesInfo: CanisterLogMessagesInfo }
  | { messages: CanisterLogMessages }
export type CanisterMemoryAggregatedData = BigUint64Array | bigint[]
export interface CanisterMetrics {
  data: CanisterMetricsData
}
export type CanisterMetricsData =
  | { hourly: Array<HourlyMetricsData> }
  | { daily: Array<DailyMetricsData> }
export interface CertifiedResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  response: string
}
export interface ConfigurationRequest {
  env: [] | [string]
  whitelisted_phone_numbers: [] | [Array<string>]
  backup_canister_id: [] | [string]
  ii_canister_id: [] | [Principal]
  whitelisted_canisters: [] | [Array<Principal>]
  git_branch: [] | [string]
  lambda: [] | [Principal]
  lambda_url: [] | [string]
  token_refresh_ttl: [] | [bigint]
  heartbeat: [] | [number]
  token_ttl: [] | [bigint]
  commit_hash: [] | [string]
}
export interface ConfigurationResponse {
  env: [] | [string]
  whitelisted_phone_numbers: [] | [Array<string>]
  backup_canister_id: [] | [string]
  ii_canister_id: [] | [Principal]
  whitelisted_canisters: [] | [Array<Principal>]
  git_branch: [] | [string]
  lambda: [] | [Principal]
  lambda_url: [] | [string]
  token_refresh_ttl: [] | [bigint]
  heartbeat: [] | [number]
  token_ttl: [] | [bigint]
  commit_hash: [] | [string]
}
export interface DailyMetricsData {
  updateCalls: bigint
  canisterHeapMemorySize: NumericEntity
  canisterCycles: NumericEntity
  canisterMemorySize: NumericEntity
  timeMillis: bigint
}
export type DeviceType =
  | { Email: null }
  | { Passkey: null }
  | { Recovery: null }
  | { Unknown: null }
  | { Password: null }
export type Error = string
export interface GetLatestLogMessagesParameters {
  upToTimeNanos: [] | [Nanos]
  count: number
  filter: [] | [GetLogMessagesFilter]
}
export interface GetLogMessagesFilter {
  analyzeCount: number
  messageRegex: [] | [string]
  messageContains: [] | [string]
}
export interface GetLogMessagesParameters {
  count: number
  filter: [] | [GetLogMessagesFilter]
  fromTimeNanos: [] | [Nanos]
}
export interface GetMetricsParameters {
  dateToMillis: bigint
  granularity: MetricsGranularity
  dateFromMillis: bigint
}
export interface HTTPAccessPointResponse {
  data: [] | [Array<AccessPointResponse>]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAccountRequest {
  anchor: bigint
  email: [] | [string]
  name: [] | [string]
  access_point: [] | [AccessPointRequest]
  wallet: [] | [WalletVariant]
  challenge_attempt: [] | [ChallengeAttempt]
}
export interface HTTPAccountResponse {
  data: [] | [AccountResponse]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAccountUpdateRequest {
  name: [] | [string]
  email: [] | [string]
}
export interface HTTPAnchorsResponse {
  data: [] | [BigUint64Array | bigint[]]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAppResponse {
  data: [] | [Application]
  error: [] | [Error]
  status_code: number
}
export interface HTTPApplicationResponse {
  data: [] | [Array<Application>]
  error: [] | [Error]
  status_code: number
}
export interface HTTPOneAccessPointResponse {
  data: [] | [AccessPointResponse]
  error: [] | [Error]
  status_code: number
}
export interface HTTPPersonasResponse {
  data: [] | [Array<PersonaResponse>]
  error: [] | [Error]
  status_code: number
}
export interface HourlyMetricsData {
  updateCalls: UpdateCallsAggregatedData
  canisterHeapMemorySize: CanisterHeapMemoryAggregatedData
  canisterCycles: CanisterCyclesAggregatedData
  canisterMemorySize: CanisterMemoryAggregatedData
  timeMillis: bigint
}
export interface LogMessagesData {
  timeNanos: Nanos
  message: string
}
export type MetricsGranularity = { hourly: null } | { daily: null }
export type Nanos = bigint
export interface NumericEntity {
  avg: bigint
  max: bigint
  min: bigint
  first: bigint
  last: bigint
}
export interface PersonaRequest {
  domain: string
  persona_name: string
  persona_id: string
}
export interface PersonaResponse {
  domain: string
  persona_name: string
  persona_id: string
}
export interface Response {
  error: [] | [Error]
  status_code: number
}
export interface StringHttpResponse {
  data: [] | [string]
  error: [] | [Error]
  status_code: number
}
export type UpdateCallsAggregatedData = BigUint64Array | bigint[]
export type WalletVariant = { II: null } | { NFID: null }
export interface _SERVICE {
  add_all_accounts_json: ActorMethod<[string], undefined>
  anchors: ActorMethod<[], HTTPAnchorsResponse>
  certify_phone_number_sha2: ActorMethod<[string, string], StringHttpResponse>
  collectCanisterMetrics: ActorMethod<[], undefined>
  configure: ActorMethod<[ConfigurationRequest], undefined>
  count_anchors: ActorMethod<[], bigint>
  create_access_point: ActorMethod<
    [AccessPointRequest],
    HTTPAccessPointResponse
  >
  create_account: ActorMethod<[HTTPAccountRequest], HTTPAccountResponse>
  create_application: ActorMethod<[Application], HTTPApplicationResponse>
  create_application_all: ActorMethod<
    [Array<Application>],
    HTTPApplicationResponse
  >
  create_persona: ActorMethod<[PersonaRequest], HTTPAccountResponse>
  delete_application: ActorMethod<[string], BoolHttpResponse>
  getCanisterLog: ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >
  getCanisterMetrics: ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >
  get_account: ActorMethod<[], HTTPAccountResponse>
  get_account_by_anchor: ActorMethod<[bigint], HTTPAccountResponse>
  get_account_by_principal: ActorMethod<[string], HTTPAccountResponse>
  get_all_accounts_json: ActorMethod<[number, number], string>
  get_application: ActorMethod<[string], HTTPAppResponse>
  get_config: ActorMethod<[], ConfigurationResponse>
  get_root_certified: ActorMethod<[], CertifiedResponse>
  is_over_the_application_limit: ActorMethod<[string], BoolHttpResponse>
  read_access_points: ActorMethod<[], HTTPAccessPointResponse>
  read_applications: ActorMethod<[], HTTPApplicationResponse>
  read_personas: ActorMethod<[], HTTPPersonasResponse>
  recover_account: ActorMethod<
    [bigint, [] | [WalletVariant]],
    HTTPAccountResponse
  >
  remove_access_point: ActorMethod<
    [AccessPointRemoveRequest],
    HTTPAccessPointResponse
  >
  remove_account: ActorMethod<[], BoolHttpResponse>
  remove_account_by_phone_number: ActorMethod<[], BoolHttpResponse>
  remove_account_by_principal: ActorMethod<[string], BoolHttpResponse>
  restore_accounts: ActorMethod<[string], BoolHttpResponse>
  store_accounts: ActorMethod<[Array<Account>], BoolHttpResponse>
  sync_controllers: ActorMethod<[], Array<string>>
  update_2fa: ActorMethod<[boolean], AccountResponse>
  update_access_point: ActorMethod<
    [AccessPointRequest],
    HTTPAccessPointResponse
  >
  update_account: ActorMethod<[HTTPAccountUpdateRequest], HTTPAccountResponse>
  update_application: ActorMethod<[Application], HTTPApplicationResponse>
  update_application_alias: ActorMethod<
    [string, string, [] | [string]],
    BoolHttpResponse
  >
  update_persona: ActorMethod<[PersonaRequest], HTTPAccountResponse>
  use_access_point: ActorMethod<[[] | [string]], HTTPOneAccessPointResponse>
  validate_signature: ActorMethod<[[] | [string]], [bigint, [] | [string]]>
  add_email_and_principal_for_create_account_validation: ActorMethod<
    [string, string, number],
    BoolHttpResponse
  >
  sync_recovery_phrase_from_internet_identity: ActorMethod<
    [bigint],
    HTTPAccountResponse
  >
}
