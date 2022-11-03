import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface BoolHttpResponse {
  data: [] | [boolean]
  error: [] | [string]
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
export interface Certificate {
  domain: string
  client_principal: string
  phone_number_sha2: [] | [string]
  created_date: bigint
}
export interface ConfigurationRequest {
  identity_manager: string
  token_ttl: [] | [bigint]
}
export interface DailyMetricsData {
  updateCalls: bigint
  canisterHeapMemorySize: NumericEntity
  canisterCycles: NumericEntity
  canisterMemorySize: NumericEntity
  timeMillis: bigint
}
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
export interface StringHttpResponse {
  data: [] | [string]
  error: [] | [string]
  status_code: number
}
export type UpdateCallsAggregatedData = Array<bigint>
export interface _SERVICE {
  collectCanisterMetrics: ActorMethod<[], undefined>
  configure: ActorMethod<[ConfigurationRequest], undefined>
  generate_pn_token: ActorMethod<[string], Array<number>>
  getCanisterLog: ActorMethod<
    [[] | [CanisterLogRequest]],
    [] | [CanisterLogResponse]
  >
  getCanisterMetrics: ActorMethod<
    [GetMetricsParameters],
    [] | [CanisterMetrics]
  >
  is_phone_number_approved: ActorMethod<[string, string], BoolHttpResponse>
  resolve_token: ActorMethod<[Array<number>], [] | [Certificate]>
}
