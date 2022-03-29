import type { Principal } from "@dfinity/principal"

export interface AccessPoint {
  principal_id: string
}
export interface AccessPointRequest {
  pub_key: Array<number>
}
export interface Account {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPoint>
  basic_entity: BasicEntity
  personas: Array<Persona>
  principal_id: string
  phone_number: [] | [string]
}
export interface AccountResponse {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPoint>
  personas: Array<PersonaResponse>
  principal_id: string
  phone_number: [] | [string]
}
export interface Application {
  user_limit: number
  domain: string
  name: string
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
export interface ConfigurationRequest {
  key: Array<number>
  whitelisted_phone_numbers: [] | [Array<string>]
  backup_canister_id: string
  lambda: Principal
  token_refresh_ttl: bigint
  heartbeat: number
  token_ttl: bigint
}
export type Credential = { phone_number: PhoneNumberCredential }
export interface CredentialResponse {
  data: [] | [Array<Credential>]
  error: [] | [Error]
  status_code: number
}
export interface EmptyHttpResponse {
  data: [] | [string]
  error: [] | [Error]
  status_code: number
}
export type Error = string
export interface HTTPAccessPointResponse {
  data: [] | [Array<AccessPoint>]
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
export interface HTTPApplicationResponse {
  data: [] | [Array<Application>]
  error: [] | [Error]
  status_code: number
}
export interface HTTPPersonasResponse {
  data: [] | [Array<PersonaResponse>]
  error: [] | [Error]
  status_code: number
}
export interface Log {
  log: string
  level: LogLevel
  timestamp: bigint
}
export type LogLevel = { INFO: null } | { ERROR: null }
export interface Persona {
  domain: string
  basic_entity: BasicEntity
  persona_id: string
}
export interface PersonaRequest {
  domain: string
  persona_id: string
}
export interface PersonaResponse {
  domain: string
  persona_id: string
}
export interface PhoneNumberCredential {
  phone_number: string
}
export interface Response {
  error: [] | [Error]
  status_code: number
}
export type Token = string
export interface TokenRequest {
  token: string
  principal_id: string
  phone_number: string
}
export interface ValidatePhoneRequest {
  principal_id: string
  phone_number: string
}
export interface _SERVICE {
  configure: (arg_0: ConfigurationRequest) => Promise<undefined>
  create_access_point: (
    arg_0: AccessPointRequest,
  ) => Promise<HTTPAccessPointResponse>
  create_account: (arg_0: HTTPAccountRequest) => Promise<HTTPAccountResponse>
  create_application: (arg_0: Application) => Promise<HTTPApplicationResponse>
  create_persona: (arg_0: PersonaRequest) => Promise<HTTPAccountResponse>
  credentials: () => Promise<CredentialResponse>
  delete_application: (arg_0: string) => Promise<BoolHttpResponse>
  get_account: () => Promise<HTTPAccountResponse>
  get_all_logs: () => Promise<Array<Log>>
  get_logs: (arg_0: bigint) => Promise<Array<Log>>
  is_over_the_application_limit: (arg_0: string) => Promise<BoolHttpResponse>
  post_token: (arg_0: TokenRequest) => Promise<Response>
  read_access_points: () => Promise<HTTPAccessPointResponse>
  read_applications: () => Promise<HTTPApplicationResponse>
  read_personas: () => Promise<HTTPPersonasResponse>
  remove_access_point: (
    arg_0: AccessPointRequest,
  ) => Promise<HTTPAccessPointResponse>
  remove_account: () => Promise<BoolHttpResponse>
  restore_accounts: (arg_0: string) => Promise<BoolHttpResponse>
  store_accounts: (arg_0: Array<Account>) => Promise<BoolHttpResponse>
  update_account: (
    arg_0: HTTPAccountUpdateRequest,
  ) => Promise<HTTPAccountResponse>
  validate_phone: (arg_0: ValidatePhoneRequest) => Promise<Response>
  verify_token: (arg_0: Token) => Promise<Response>
}
