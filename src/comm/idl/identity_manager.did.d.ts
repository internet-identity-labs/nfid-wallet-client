import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface AccessPointRemoveRequest { 'pub_key' : Array<number> }
export interface AccessPointRequest {
  'icon' : string,
  'device' : string,
  'pub_key' : Array<number>,
  'browser' : string,
}
export interface AccessPointResponse {
  'icon' : string,
  'device' : string,
  'browser' : string,
  'last_used' : bigint,
  'principal_id' : string,
}
export interface Account {
  'name' : [] | [string],
  'anchor' : bigint,
  'access_points' : Array<AccessPointRequest>,
  'basic_entity' : BasicEntity,
  'personas' : Array<PersonaResponse>,
  'principal_id' : string,
  'phone_number' : [] | [string],
}
export interface AccountResponse {
  'name' : [] | [string],
  'anchor' : bigint,
  'access_points' : Array<AccessPointResponse>,
  'personas' : Array<PersonaResponse>,
  'principal_id' : string,
  'phone_number' : [] | [string],
}
export interface Application {
  'user_limit' : number,
  'domain' : string,
  'name' : string,
}
export interface BasicEntity {
  'modified_date' : bigint,
  'created_date' : bigint,
}
export interface BoolHttpResponse {
  'data' : [] | [boolean],
  'error' : [] | [Error],
  'status_code' : number,
}
export type CanisterCyclesAggregatedData = Array<bigint>;
export type CanisterHeapMemoryAggregatedData = Array<bigint>;
export type CanisterLogFeature = { 'filterMessageByContains' : null } |
  { 'filterMessageByRegex' : null };
export interface CanisterLogMessages {
  'data' : Array<LogMessagesData>,
  'lastAnalyzedMessageTimeNanos' : [] | [Nanos],
}
export interface CanisterLogMessagesInfo {
  'features' : Array<[] | [CanisterLogFeature]>,
  'lastTimeNanos' : [] | [Nanos],
  'count' : number,
  'firstTimeNanos' : [] | [Nanos],
}
export type CanisterLogRequest = { 'getMessagesInfo' : null } |
  { 'getMessages' : GetLogMessagesParameters } |
  { 'getLatestMessages' : GetLatestLogMessagesParameters };
export type CanisterLogResponse = { 'messagesInfo' : CanisterLogMessagesInfo } |
  { 'messages' : CanisterLogMessages };
export type CanisterMemoryAggregatedData = Array<bigint>;
export interface CanisterMetrics { 'data' : CanisterMetricsData }
export type CanisterMetricsData = { 'hourly' : Array<HourlyMetricsData> } |
  { 'daily' : Array<DailyMetricsData> };
export interface ConfigurationRequest {
  'env' : [] | [string],
  'whitelisted_phone_numbers' : [] | [Array<string>],
  'backup_canister_id' : [] | [string],
  'ii_canister_id' : [] | [Principal],
  'whitelisted_canisters' : [] | [Array<Principal>],
  'git_branch' : [] | [string],
  'lambda' : [] | [Principal],
  'token_refresh_ttl' : [] | [bigint],
  'heartbeat' : [] | [number],
  'token_ttl' : [] | [bigint],
  'commit_hash' : [] | [string],
}
export interface ConfigurationResponse {
  'env' : [] | [string],
  'whitelisted_phone_numbers' : [] | [Array<string>],
  'backup_canister_id' : [] | [string],
  'ii_canister_id' : [] | [Principal],
  'whitelisted_canisters' : [] | [Array<Principal>],
  'git_branch' : [] | [string],
  'lambda' : [] | [Principal],
  'token_refresh_ttl' : [] | [bigint],
  'heartbeat' : [] | [number],
  'token_ttl' : [] | [bigint],
  'commit_hash' : [] | [string],
}
export type Credential = { 'phone_number' : PhoneNumberCredential };
export interface CredentialResponse {
  'data' : [] | [Array<Credential>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface DailyMetricsData {
  'updateCalls' : bigint,
  'canisterHeapMemorySize' : NumericEntity,
  'canisterCycles' : NumericEntity,
  'canisterMemorySize' : NumericEntity,
  'timeMillis' : bigint,
}
export type Error = string;
export interface GetLatestLogMessagesParameters {
  'upToTimeNanos' : [] | [Nanos],
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
}
export interface GetLogMessagesFilter {
  'analyzeCount' : number,
  'messageRegex' : [] | [string],
  'messageContains' : [] | [string],
}
export interface GetLogMessagesParameters {
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
  'fromTimeNanos' : [] | [Nanos],
}
export interface GetMetricsParameters {
  'dateToMillis' : bigint,
  'granularity' : MetricsGranularity,
  'dateFromMillis' : bigint,
}
export interface HTTPAccessPointResponse {
  'data' : [] | [Array<AccessPointResponse>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPAccountRequest { 'anchor' : bigint }
export interface HTTPAccountResponse {
  'data' : [] | [AccountResponse],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPAccountUpdateRequest { 'name' : [] | [string] }
export interface HTTPAnchorsResponse {
  'data' : [] | [Array<bigint>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPApplicationResponse {
  'data' : [] | [Array<Application>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HTTPPersonasResponse {
  'data' : [] | [Array<PersonaResponse>],
  'error' : [] | [Error],
  'status_code' : number,
}
export interface HourlyMetricsData {
  'updateCalls' : UpdateCallsAggregatedData,
  'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
  'canisterCycles' : CanisterCyclesAggregatedData,
  'canisterMemorySize' : CanisterMemoryAggregatedData,
  'timeMillis' : bigint,
}
export interface LogMessagesData { 'timeNanos' : Nanos, 'message' : string }
export type MetricsGranularity = { 'hourly' : null } |
  { 'daily' : null };
export type Nanos = bigint;
export interface NumericEntity {
  'avg' : bigint,
  'max' : bigint,
  'min' : bigint,
  'first' : bigint,
  'last' : bigint,
}
export interface PersonaRequest {
  'domain' : string,
  'persona_name' : string,
  'persona_id' : string,
}
export interface PersonaResponse {
  'domain' : string,
  'persona_name' : string,
  'persona_id' : string,
}
export interface PhoneNumberCredential { 'phone_number' : string }
export interface Response { 'error' : [] | [Error], 'status_code' : number }
export interface StringHttpResponse {
  'data' : [] | [string],
  'error' : [] | [Error],
  'status_code' : number,
}
export type Token = string;
export interface TokenRequest {
  'token' : string,
  'phone_number_hash' : string,
  'principal_id' : string,
  'phone_number_encrypted' : string,
}
export type UpdateCallsAggregatedData = Array<bigint>;
export interface ValidatePhoneRequest {
  'phone_number_hash' : string,
  'principal_id' : string,
}
export interface _SERVICE {
  'anchors' : ActorMethod<[], HTTPAnchorsResponse>,
  'certify_phone_number_sha2' : ActorMethod<
    [string, string],
    StringHttpResponse,
  >,
  'collectCanisterMetrics' : ActorMethod<[], undefined>,
  'configure' : ActorMethod<[ConfigurationRequest], undefined>,
  'create_access_point' : ActorMethod<
    [AccessPointRequest],
    HTTPAccessPointResponse,
  >,
  'create_account' : ActorMethod<[HTTPAccountRequest], HTTPAccountResponse>,
  'create_application' : ActorMethod<[Application], HTTPApplicationResponse>,
  'create_persona' : ActorMethod<[PersonaRequest], HTTPAccountResponse>,
  'credentials' : ActorMethod<[], CredentialResponse>,
  'delete_application' : ActorMethod<[string], BoolHttpResponse>,
  'getCanisterLog' : ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse],
  >,
  'getCanisterMetrics' : ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics],
  >,
  'get_account' : ActorMethod<[], HTTPAccountResponse>,
  'get_account_by_anchor' : ActorMethod<[bigint], HTTPAccountResponse>,
  'get_account_by_principal' : ActorMethod<[string], HTTPAccountResponse>,
  'get_config' : ActorMethod<[], ConfigurationResponse>,
  'is_over_the_application_limit' : ActorMethod<[string], BoolHttpResponse>,
  'post_token' : ActorMethod<[TokenRequest], Response>,
  'read_access_points' : ActorMethod<[], HTTPAccessPointResponse>,
  'read_applications' : ActorMethod<[], HTTPApplicationResponse>,
  'read_personas' : ActorMethod<[], HTTPPersonasResponse>,
  'recover_account' : ActorMethod<[bigint], HTTPAccountResponse>,
  'remove_access_point' : ActorMethod<
    [AccessPointRemoveRequest],
    HTTPAccessPointResponse,
  >,
  'remove_account' : ActorMethod<[], BoolHttpResponse>,
  'restore_accounts' : ActorMethod<[string], BoolHttpResponse>,
  'store_accounts' : ActorMethod<[Array<Account>], BoolHttpResponse>,
  'update_access_point' : ActorMethod<
    [AccessPointRequest],
    HTTPAccessPointResponse,
  >,
  'update_account' : ActorMethod<
    [HTTPAccountUpdateRequest],
    HTTPAccountResponse,
  >,
  'use_access_point' : ActorMethod<[], HTTPAccessPointResponse>,
  'validate_phone' : ActorMethod<[ValidatePhoneRequest], Response>,
  'verify_token' : ActorMethod<[Token], Response>,
}
