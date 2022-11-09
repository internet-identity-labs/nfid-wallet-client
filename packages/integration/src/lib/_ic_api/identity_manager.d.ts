import type { Principal } from "@dfinity/principal"

export interface AccessPointRemoveRequest {
  pub_key: string
}
export interface AccessPointRequest {
  icon: string
  device: string
  pub_key: string
  browser: string
}
export interface AccessPointResponse {
  icon: string
  device: string
  browser: string
  last_used: bigint
  principal_id: string
}
export interface Account {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPointRequest>
  basic_entity: BasicEntity
  personas: Array<PersonaResponse>
  principal_id: string
  phone_number: [] | [string]
}
export interface AccountResponse {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPointResponse>
  personas: Array<PersonaResponse>
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
export type CanisterCyclesAggregatedData = Array<bigint>
export type CanisterHeapMemoryAggregatedData = Array<bigint>
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
export type CanisterMemoryAggregatedData = Array<bigint>
export interface CanisterMetrics {
  data: CanisterMetricsData
}
export type CanisterMetricsData =
  | { hourly: Array<HourlyMetricsData> }
  | { daily: Array<DailyMetricsData> }
export interface ConfigurationRequest {
  env: [] | [string]
  whitelisted_phone_numbers: [] | [Array<string>]
  backup_canister_id: [] | [string]
  ii_canister_id: [] | [Principal]
  whitelisted_canisters: [] | [Array<Principal>]
  git_branch: [] | [string]
  lambda: [] | [Principal]
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
  token_refresh_ttl: [] | [bigint]
  heartbeat: [] | [number]
  token_ttl: [] | [bigint]
  commit_hash: [] | [string]
}
export type Credential = { phone_number: PhoneNumberCredential }
export interface CredentialResponse {
  data: [] | [Array<Credential>]
  error: [] | [Error]
  status_code: number
}
export interface DailyMetricsData {
  updateCalls: bigint
  canisterHeapMemorySize: NumericEntity
  canisterCycles: NumericEntity
  canisterMemorySize: NumericEntity
  timeMillis: bigint
}
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
}
export interface HTTPAccountResponse {
  data: [] | [AccountResponse]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAccountUpdateRequest {
  name: [] | [string]
}
export interface HTTPAnchorsResponse {
  data: [] | [Array<bigint>]
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
export interface PhoneNumberCredential {
  phone_number: string
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
export type Token = string
export interface TokenRequest {
  token: string
  phone_number_hash: string
  principal_id: string
  phone_number_encrypted: string
}
export type UpdateCallsAggregatedData = Array<bigint>
export interface ValidatePhoneRequest {
  phone_number_hash: string
  principal_id: string
}
export interface _SERVICE {
  add_all_accounts_json: (arg_0: string) => Promise<undefined>
  anchors: () => Promise<HTTPAnchorsResponse>
  certify_phone_number_sha2: (
    arg_0: string,
    arg_1: string,
  ) => Promise<StringHttpResponse>
  collectCanisterMetrics: () => Promise<undefined>
  configure: (arg_0: ConfigurationRequest) => Promise<undefined>
  count_anchors: () => Promise<bigint>
  create_access_point: (
    arg_0: AccessPointRequest,
  ) => Promise<HTTPAccessPointResponse>
  create_account: (arg_0: HTTPAccountRequest) => Promise<HTTPAccountResponse>
  create_application: (arg_0: Application) => Promise<HTTPApplicationResponse>
  create_persona: (arg_0: PersonaRequest) => Promise<HTTPAccountResponse>
  credentials: () => Promise<CredentialResponse>
  delete_application: (arg_0: string) => Promise<BoolHttpResponse>
  getCanisterLog: (
    arg_0: [] | [CanisterLogRequest],
  ) => Promise<[] | [CanisterLogResponse]>
  getCanisterMetrics: (
    arg_0: GetMetricsParameters,
  ) => Promise<[] | [CanisterMetrics]>
  get_account: () => Promise<HTTPAccountResponse>
  get_account_by_anchor: (arg_0: bigint) => Promise<HTTPAccountResponse>
  get_account_by_principal: (arg_0: string) => Promise<HTTPAccountResponse>
  get_all_accounts_json: (arg_0: number, arg_1: number) => Promise<string>
  get_application: (arg_0: string) => Promise<HTTPAppResponse>
  get_config: () => Promise<ConfigurationResponse>
  is_over_the_application_limit: (arg_0: string) => Promise<BoolHttpResponse>
  post_token: (arg_0: TokenRequest) => Promise<Response>
  read_access_points: () => Promise<HTTPAccessPointResponse>
  read_applications: () => Promise<HTTPApplicationResponse>
  read_personas: () => Promise<HTTPPersonasResponse>
  recover_account: (arg_0: bigint) => Promise<HTTPAccountResponse>
  remove_access_point: (
    arg_0: AccessPointRemoveRequest,
  ) => Promise<HTTPAccessPointResponse>
  remove_account: () => Promise<BoolHttpResponse>
  remove_account_by_phone_number: () => Promise<BoolHttpResponse>
  remove_account_by_principal: (arg_0: string) => Promise<BoolHttpResponse>
  restore_accounts: (arg_0: string) => Promise<BoolHttpResponse>
  store_accounts: (arg_0: Array<Account>) => Promise<BoolHttpResponse>
  sync_controllers: () => Promise<Array<string>>
  update_access_point: (
    arg_0: AccessPointRequest,
  ) => Promise<HTTPAccessPointResponse>
  update_account: (
    arg_0: HTTPAccountUpdateRequest,
  ) => Promise<HTTPAccountResponse>
  update_application: (arg_0: Application) => Promise<HTTPApplicationResponse>
  update_application_alias: (
    arg_0: string,
    arg_1: string,
    arg_2: [] | [string],
  ) => Promise<BoolHttpResponse>
  update_persona: (arg_0: PersonaRequest) => Promise<HTTPAccountResponse>
  use_access_point: (
    arg_0: [] | [string],
  ) => Promise<HTTPOneAccessPointResponse>
  validate_phone: (arg_0: ValidatePhoneRequest) => Promise<Response>
  validate_signature: (arg_0: [] | [string]) => Promise<[bigint, [] | [string]]>
  verify_token: (arg_0: Token) => Promise<Response>
}
