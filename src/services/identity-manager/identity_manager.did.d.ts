import type { Principal } from "@dfinity/principal"

export interface AccessPoint {
  principal_id: string
}
export interface AccessPointRequest {
  pub_key: Array<number>
}
export interface AccountResponse {
  name: [] | [string]
  anchor: bigint
  access_points: Array<AccessPoint>
  personas: Array<PersonaVariant>
  principal_id: string
  phone_number: [] | [string]
}
export interface Application {
  user_limit: number
  domain: string
  name: string
}
export interface BoolHttpResponse {
  data: [] | [boolean]
  error: [] | [Error]
  status_code: number
}
export interface ConfigurationRequest {
  key: Array<number>
  whitelisted_phone_numbers: [] | [Array<string>]
  lambda: Principal
  token_refresh_ttl: bigint
  token_ttl: bigint
}
export type Domain = string
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
  data: [] | [Array<PersonaVariant>]
  error: [] | [Error]
  status_code: number
}
export interface Log {
  log: string
  level: LogLevel
  timestamp: bigint
}
export type LogLevel = { INFO: null } | { ERROR: null }
export type Name = string
export interface PersonaIIResponse {
  domain: string
  anchor: bigint
}
export interface PersonaNFIDResponse {
  domain: string
  persona_id: string
}
export type PersonaVariant =
  | { ii_persona: PersonaIIResponse }
  | { nfid_persona: PersonaNFIDResponse }
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
  create_persona: (arg_0: PersonaVariant) => Promise<HTTPAccountResponse>
  delete_application: (arg_0: Name) => Promise<BoolHttpResponse>
  get_account: () => Promise<HTTPAccountResponse>
  get_all_logs: () => Promise<Array<Log>>
  get_logs: (arg_0: bigint) => Promise<Array<Log>>
  is_over_the_application_limit: (arg_0: Domain) => Promise<BoolHttpResponse>
  post_token: (arg_0: TokenRequest) => Promise<Response>
  read_access_points: () => Promise<HTTPAccessPointResponse>
  read_applications: () => Promise<HTTPApplicationResponse>
  read_personas: () => Promise<HTTPPersonasResponse>
  remove_access_point: (
    arg_0: AccessPointRequest,
  ) => Promise<HTTPAccessPointResponse>
  remove_account: () => Promise<BoolHttpResponse>
  update_account: (
    arg_0: HTTPAccountUpdateRequest,
  ) => Promise<HTTPAccountResponse>
  validate_phone: (arg_0: ValidatePhoneRequest) => Promise<Response>
  verify_token: (arg_0: Token) => Promise<Response>
}
