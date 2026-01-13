export const idlFactory = ({ IDL }: any) => {
  const ConfigurationRequest = IDL.Record({
    identity_manager: IDL.Text,
    token_ttl: IDL.Opt(IDL.Nat64),
  })
  const GetLogMessagesFilter = IDL.Record({
    analyzeCount: IDL.Nat32,
    messageRegex: IDL.Opt(IDL.Text),
    messageContains: IDL.Opt(IDL.Text),
  })
  const Nanos = IDL.Nat64
  const GetLogMessagesParameters = IDL.Record({
    count: IDL.Nat32,
    filter: IDL.Opt(GetLogMessagesFilter),
    fromTimeNanos: IDL.Opt(Nanos),
  })
  const GetLatestLogMessagesParameters = IDL.Record({
    upToTimeNanos: IDL.Opt(Nanos),
    count: IDL.Nat32,
    filter: IDL.Opt(GetLogMessagesFilter),
  })
  const CanisterLogRequest = IDL.Variant({
    getMessagesInfo: IDL.Null,
    getMessages: GetLogMessagesParameters,
    getLatestMessages: GetLatestLogMessagesParameters,
  })
  const CanisterLogFeature = IDL.Variant({
    filterMessageByContains: IDL.Null,
    filterMessageByRegex: IDL.Null,
  })
  const CanisterLogMessagesInfo = IDL.Record({
    features: IDL.Vec(IDL.Opt(CanisterLogFeature)),
    lastTimeNanos: IDL.Opt(Nanos),
    count: IDL.Nat32,
    firstTimeNanos: IDL.Opt(Nanos),
  })
  const LogMessagesData = IDL.Record({
    timeNanos: Nanos,
    message: IDL.Text,
  })
  const CanisterLogMessages = IDL.Record({
    data: IDL.Vec(LogMessagesData),
    lastAnalyzedMessageTimeNanos: IDL.Opt(Nanos),
  })
  const CanisterLogResponse = IDL.Variant({
    messagesInfo: CanisterLogMessagesInfo,
    messages: CanisterLogMessages,
  })
  const MetricsGranularity = IDL.Variant({
    hourly: IDL.Null,
    daily: IDL.Null,
  })
  const GetMetricsParameters = IDL.Record({
    dateToMillis: IDL.Nat,
    granularity: MetricsGranularity,
    dateFromMillis: IDL.Nat,
  })
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64)
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64)
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64)
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64)
  const HourlyMetricsData = IDL.Record({
    updateCalls: UpdateCallsAggregatedData,
    canisterHeapMemorySize: CanisterHeapMemoryAggregatedData,
    canisterCycles: CanisterCyclesAggregatedData,
    canisterMemorySize: CanisterMemoryAggregatedData,
    timeMillis: IDL.Int,
  })
  const NumericEntity = IDL.Record({
    avg: IDL.Nat64,
    max: IDL.Nat64,
    min: IDL.Nat64,
    first: IDL.Nat64,
    last: IDL.Nat64,
  })
  const DailyMetricsData = IDL.Record({
    updateCalls: IDL.Nat64,
    canisterHeapMemorySize: NumericEntity,
    canisterCycles: NumericEntity,
    canisterMemorySize: NumericEntity,
    timeMillis: IDL.Int,
  })
  const CanisterMetricsData = IDL.Variant({
    hourly: IDL.Vec(HourlyMetricsData),
    daily: IDL.Vec(DailyMetricsData),
  })
  const CanisterMetrics = IDL.Record({ data: CanisterMetricsData })
  const BoolHttpResponse = IDL.Record({
    data: IDL.Opt(IDL.Bool),
    error: IDL.Opt(IDL.Text),
    status_code: IDL.Nat16,
  })
  const Certificate = IDL.Record({
    domain: IDL.Text,
    client_principal: IDL.Text,
    phone_number_sha2: IDL.Opt(IDL.Text),
    created_date: IDL.Nat64,
  })
  return IDL.Service({
    collectCanisterMetrics: IDL.Func([], [], []),
    configure: IDL.Func([ConfigurationRequest], [], []),
    generate_pn_token: IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat8)], []),
    getCanisterLog: IDL.Func(
      [IDL.Opt(CanisterLogRequest)],
      [IDL.Opt(CanisterLogResponse)],
      ["query"],
    ),
    getCanisterMetrics: IDL.Func(
      [GetMetricsParameters],
      [IDL.Opt(CanisterMetrics)],
      ["query"],
    ),
    is_phone_number_approved: IDL.Func(
      [IDL.Text, IDL.Text],
      [BoolHttpResponse],
      [],
    ),
    resolve_token: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Opt(Certificate)], []),
  })
}
export const init = ({ IDL: _IDL }: any) => {
  return []
}
