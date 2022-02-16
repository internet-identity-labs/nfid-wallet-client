import type { Principal } from '@dfinity/principal';
export interface AccessPoint {
  'model' : string,
  'make' : string,
  'name' : string,
  'pub_key' : string,
  'browser' : string,
  'last_used' : string,
}
export interface AccountResponse {
  'name' : string,
  'anchor' : bigint,
  'access_points' : Array<AccessPoint>,
  'personas' : Array<PersonaVariant>,
  'principal_id' : string,
  'phone_number' : string,
}
export interface Application {
  'user_limit' : number,
  'domain' : string,
  'name' : string,
}
export interface BoolHttpResponse {
  'data' : [] | [boolean],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface ConfigurationRequest {
  'key' : Array<number>,
  'whitelisted_phone_numbers' : [] | [Array<string>],
  'lambda' : Principal,
  'token_refresh_ttl' : bigint,
  'token_ttl' : bigint,
}
export type Domain = string;
export interface EmptyHttpResponse {
  'data' : [] | [string],
  'error' : [] | [Error],
  'status_code' : number,
}
export type Error = string;
export interface HTTPAccessPointResponse {
  'data' : [] | [Array<AccessPoint>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPAccountRequest {
  'token' : string,
  'name' : string,
  'anchor' : bigint,
  'phone_number' : string,
}
export interface HTTPAccountResponse {
  'data' : [] | [AccountResponse],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPAccountUpdateRequest { 'name' : [] | [string] }
export interface HTTPApplicationResponse {
  'data' : [] | [Array<Application>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPPersonasResponse {
  'data' : [] | [Array<PersonaVariant>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPVerifyPhoneNumberRequest {
  'token' : string,
  'phone_number' : string,
}
export type Name = string;
export interface PersonaIIResponse { 'domain' : string, 'anchor' : bigint }
export interface PersonaNFIDResponse {
  'domain' : string,
  'persona_id' : string,
}
export type PersonaVariant = { 'ii_persona' : PersonaIIResponse } |
  { 'nfid_persona' : PersonaNFIDResponse };
export type PhoneNumber = string;
export type Token = string;
export interface _SERVICE {
  'configure' : (arg_0: ConfigurationRequest) => Promise<undefined>,
  'create_access_point' : (arg_0: AccessPoint) => Promise<
      HTTPAccessPointResponse
    >,
  'create_account' : (arg_0: HTTPAccountRequest) => Promise<
      HTTPAccountResponse
    >,
  'create_application' : (arg_0: Application) => Promise<
      HTTPApplicationResponse
    >,
  'create_persona' : (arg_0: PersonaVariant) => Promise<HTTPAccountResponse>,
  'delete_application' : (arg_0: Name) => Promise<BoolHttpResponse>,
  'get_account' : () => Promise<HTTPAccountResponse>,
  'is_over_the_application_limit' : (arg_0: Domain) => Promise<
      BoolHttpResponse
    >,
  'post_token' : (arg_0: HTTPVerifyPhoneNumberRequest) => Promise<
      BoolHttpResponse
    >,
  'read_access_points' : () => Promise<HTTPAccessPointResponse>,
  'read_applications' : () => Promise<HTTPApplicationResponse>,
  'read_personas' : () => Promise<HTTPPersonasResponse>,
  'remove_access_point' : (arg_0: AccessPoint) => Promise<
      HTTPAccessPointResponse
    >,
  'update_access_point' : (arg_0: AccessPoint) => Promise<
      HTTPAccessPointResponse
    >,
  'update_account' : (arg_0: HTTPAccountUpdateRequest) => Promise<
      HTTPAccountResponse
    >,
  'validate_phone_number' : (arg_0: PhoneNumber) => Promise<BoolHttpResponse>,
}
