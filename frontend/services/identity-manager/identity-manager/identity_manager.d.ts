import type { Principal } from "@dfinity/principal"
export interface AccountResponse {
  name: string
  personas: Array<PersonaVariant>
  principal_id: string
  phone_number: string
  devices: Array<Device>
}
export interface BoolHttpResponse {
  data: [] | [boolean]
  error: [] | [Error]
  status_code: number
}
export interface Configuration {
  lambda: Principal
  token_ttl: bigint
}
export interface Device {
  model: string
  pub_key_hash: string
  make: string
  browser: string
  last_used: string
}
export interface EmptyHttpResponse {
  data: [] | [string]
  error: [] | [Error]
  status_code: number
}
export type Error = string
export interface HTTPAccountRequest {
  token: string
  name: string
  phone_number: string
}
export interface HTTPAccountResponse {
  data: [] | [AccountResponse]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAccountUpdateRequest {
  name: [] | [string]
}
export interface HTTPDeviceResponse {
  data: [] | [Array<Device>]
  error: [] | [Error]
  status_code: number
}
export interface HTTPPersonasResponse {
  data: [] | [Array<PersonaVariant>]
  error: [] | [Error]
  status_code: number
}
export interface HTTPVerifyPhoneNumberRequest {
  token: string
  phone_number: string
}
export interface PersonaIIResponse {
  domain: string
  anchor: string
}
export interface PersonaNFIDResponse {
  domain: string
  persona_id: string
}
export type PersonaVariant =
  | { ii_persona: PersonaIIResponse }
  | { nfid_persona: PersonaNFIDResponse }
export type PhoneNumber = string
export type Token = string
export interface _SERVICE {
  configure: (arg_0: Configuration) => Promise<undefined>
  create_account: (arg_0: HTTPAccountRequest) => Promise<HTTPAccountResponse>
  create_device: (arg_0: Device) => Promise<BoolHttpResponse>
  create_persona: (arg_0: PersonaVariant) => Promise<HTTPAccountResponse>
  get_account: () => Promise<HTTPAccountResponse>
  post_token: (arg_0: HTTPVerifyPhoneNumberRequest) => Promise<BoolHttpResponse>
  read_devices: () => Promise<HTTPDeviceResponse>
  read_personas: () => Promise<HTTPPersonasResponse>
  update_account: (
    arg_0: HTTPAccountUpdateRequest,
  ) => Promise<HTTPAccountResponse>
}
