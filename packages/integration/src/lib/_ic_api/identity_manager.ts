export const idlFactory = ({ IDL }: any) => {
  const Error = IDL.Text
  const HTTPAnchorsResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(IDL.Nat64)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const StringHttpResponse = IDL.Record({
    data: IDL.Opt(IDL.Text),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })

  const Challenge = IDL.Record({
    png_base64: IDL.Opt(IDL.Text),
    challenge_key: IDL.Text,
  })
  const ConfigurationRequest = IDL.Record({
    env: IDL.Opt(IDL.Text),
    whitelisted_phone_numbers: IDL.Opt(IDL.Vec(IDL.Text)),
    backup_canister_id: IDL.Opt(IDL.Text),
    ii_canister_id: IDL.Opt(IDL.Principal),
    whitelisted_canisters: IDL.Opt(IDL.Vec(IDL.Principal)),
    git_branch: IDL.Opt(IDL.Text),
    lambda: IDL.Opt(IDL.Principal),
    token_refresh_ttl: IDL.Opt(IDL.Nat64),
    heartbeat: IDL.Opt(IDL.Nat32),
    token_ttl: IDL.Opt(IDL.Nat64),
    commit_hash: IDL.Opt(IDL.Text),
  })
  const DeviceType = IDL.Variant({
    Email: IDL.Null,
    Passkey: IDL.Null,
    Recovery: IDL.Null,
    Unknown: IDL.Null,
    Password: IDL.Null,
  })
  const AccessPointRequest = IDL.Record({
    icon: IDL.Text,
    device_type: DeviceType,
    device: IDL.Text,
    pub_key: IDL.Text,
    browser: IDL.Text,
    credential_id: IDL.Opt(IDL.Text),
  })
  const AccessPointResponse = IDL.Record({
    icon: IDL.Text,
    device_type: DeviceType,
    device: IDL.Text,
    browser: IDL.Text,
    last_used: IDL.Nat64,
    principal_id: IDL.Text,
    credential_id: IDL.Opt(IDL.Text),
  })
  const HTTPAccessPointResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(AccessPointResponse)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })

  const ChallengeAttempt = IDL.Record({
    chars: IDL.Opt(IDL.Text),
    challenge_key: IDL.Text,
  })
  const WalletVariant = IDL.Variant({ II: IDL.Null, NFID: IDL.Null })
  const HTTPAccountRequest = IDL.Record({
    anchor: IDL.Nat64,
    access_point: IDL.Opt(AccessPointRequest),
    wallet: IDL.Opt(WalletVariant),
    email: IDL.Opt(IDL.Text),
    name: IDL.Opt(IDL.Text),
    challenge_attempt: IDL.Opt(ChallengeAttempt),
  })
  const PersonaResponse = IDL.Record({
    domain: IDL.Text,
    persona_name: IDL.Text,
    persona_id: IDL.Text,
  })
  const AccountResponse = IDL.Record({
    name: IDL.Opt(IDL.Text),
    anchor: IDL.Nat64,
    access_points: IDL.Vec(AccessPointResponse),
    personas: IDL.Vec(PersonaResponse),
    is2fa_enabled: IDL.Bool,
    wallet: WalletVariant,
    principal_id: IDL.Text,
    phone_number: IDL.Opt(IDL.Text),
    email: IDL.Opt(IDL.Text),
  })
  const HTTPAccountResponse = IDL.Record({
    data: IDL.Opt(AccountResponse),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const Application = IDL.Record({
    img: IDL.Opt(IDL.Text),
    alias: IDL.Opt(IDL.Vec(IDL.Text)),
    user_limit: IDL.Nat16,
    domain: IDL.Text,
    name: IDL.Text,
    is_nft_storage: IDL.Opt(IDL.Bool),
    is_trusted: IDL.Opt(IDL.Bool),
    is_iframe_allowed: IDL.Opt(IDL.Bool),
  })
  const HTTPApplicationResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(Application)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const PersonaRequest = IDL.Record({
    domain: IDL.Text,
    persona_name: IDL.Text,
    persona_id: IDL.Text,
  })
  const PhoneNumberCredential = IDL.Record({ phone_number: IDL.Text })
  const Credential = IDL.Variant({ phone_number: PhoneNumberCredential })
  const CredentialResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(Credential)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const BoolHttpResponse = IDL.Record({
    data: IDL.Opt(IDL.Bool),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
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
  const HTTPAppResponse = IDL.Record({
    data: IDL.Opt(Application),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const ConfigurationResponse = IDL.Record({
    env: IDL.Opt(IDL.Text),
    whitelisted_phone_numbers: IDL.Opt(IDL.Vec(IDL.Text)),
    backup_canister_id: IDL.Opt(IDL.Text),
    ii_canister_id: IDL.Opt(IDL.Principal),
    whitelisted_canisters: IDL.Opt(IDL.Vec(IDL.Principal)),
    git_branch: IDL.Opt(IDL.Text),
    lambda: IDL.Opt(IDL.Principal),
    token_refresh_ttl: IDL.Opt(IDL.Nat64),
    heartbeat: IDL.Opt(IDL.Nat32),
    token_ttl: IDL.Opt(IDL.Nat64),
    commit_hash: IDL.Opt(IDL.Text),
  })
  const TokenRequest = IDL.Record({
    token: IDL.Text,
    phone_number_hash: IDL.Text,
    principal_id: IDL.Text,
    phone_number_encrypted: IDL.Text,
  })
  const Response = IDL.Record({
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const HTTPPersonasResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(PersonaResponse)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const AccessPointRemoveRequest = IDL.Record({ pub_key: IDL.Text })
  const BasicEntity = IDL.Record({
    modified_date: IDL.Nat64,
    created_date: IDL.Nat64,
  })
  const Account = IDL.Record({
    name: IDL.Opt(IDL.Text),
    anchor: IDL.Nat64,
    access_points: IDL.Vec(AccessPointRequest),
    basic_entity: BasicEntity,
    personas: IDL.Vec(PersonaResponse),
    wallet: WalletVariant,
    principal_id: IDL.Text,
    phone_number: IDL.Opt(IDL.Text),
  })
  const HTTPAccountUpdateRequest = IDL.Record({
    name: IDL.Opt(IDL.Text),
    email: IDL.Opt(IDL.Text),
  })
  const HTTPOneAccessPointResponse = IDL.Record({
    data: IDL.Opt(AccessPointResponse),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const ValidatePhoneRequest = IDL.Record({
    phone_number_hash: IDL.Text,
    principal_id: IDL.Text,
  })
  const Token = IDL.Text
  return IDL.Service({
    add_all_accounts_json: IDL.Func([IDL.Text], [], []),
    anchors: IDL.Func([], [HTTPAnchorsResponse], ["query"]),
    certify_phone_number_sha2: IDL.Func(
      [IDL.Text, IDL.Text],
      [StringHttpResponse],
      ["query"],
    ),
    collectCanisterMetrics: IDL.Func([], [], []),
    configure: IDL.Func([ConfigurationRequest], [], []),
    count_anchors: IDL.Func([], [IDL.Nat64], ["query"]),
    create_access_point: IDL.Func(
      [AccessPointRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    create_account: IDL.Func([HTTPAccountRequest], [HTTPAccountResponse], []),
    create_application: IDL.Func([Application], [HTTPApplicationResponse], []),
    create_application_all: IDL.Func(
      [IDL.Vec(Application)],
      [HTTPApplicationResponse],
      [],
    ),
    create_persona: IDL.Func([PersonaRequest], [HTTPAccountResponse], []),
    credentials: IDL.Func([], [CredentialResponse], []),
    delete_application: IDL.Func([IDL.Text], [BoolHttpResponse], []),
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
    get_account: IDL.Func([], [HTTPAccountResponse], ["query"]),
    get_account_by_anchor: IDL.Func(
      [IDL.Nat64],
      [HTTPAccountResponse],
      ["query"],
    ),
    get_account_by_principal: IDL.Func(
      [IDL.Text],
      [HTTPAccountResponse],
      ["query"],
    ),
    get_all_accounts_json: IDL.Func(
      [IDL.Nat32, IDL.Nat32],
      [IDL.Text],
      ["query"],
    ),
    get_application: IDL.Func([IDL.Text], [HTTPAppResponse], []),
    get_config: IDL.Func([], [ConfigurationResponse], []),
    is_over_the_application_limit: IDL.Func(
      [IDL.Text],
      [BoolHttpResponse],
      ["query"],
    ),
    post_token: IDL.Func([TokenRequest], [Response], []),
    read_access_points: IDL.Func([], [HTTPAccessPointResponse], ["query"]),
    read_applications: IDL.Func([], [HTTPApplicationResponse], ["query"]),
    read_personas: IDL.Func([], [HTTPPersonasResponse], ["query"]),
    recover_account: IDL.Func(
      [IDL.Nat64, IDL.Opt(WalletVariant)],
      [HTTPAccountResponse],
      [],
    ),
    remove_access_point: IDL.Func(
      [AccessPointRemoveRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    remove_account: IDL.Func([], [BoolHttpResponse], []),
    remove_account_by_phone_number: IDL.Func([], [BoolHttpResponse], []),
    remove_account_by_principal: IDL.Func([IDL.Text], [BoolHttpResponse], []),
    restore_accounts: IDL.Func([IDL.Text], [BoolHttpResponse], []),
    store_accounts: IDL.Func([IDL.Vec(Account)], [BoolHttpResponse], []),
    sync_controllers: IDL.Func([], [IDL.Vec(IDL.Text)], []),
    update_2fa: IDL.Func([IDL.Bool], [AccountResponse], []),
    update_access_point: IDL.Func(
      [AccessPointRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    update_account: IDL.Func(
      [HTTPAccountUpdateRequest],
      [HTTPAccountResponse],
      [],
    ),
    update_application: IDL.Func([Application], [HTTPApplicationResponse], []),
    update_application_alias: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
      [BoolHttpResponse],
      [],
    ),
    update_persona: IDL.Func([PersonaRequest], [HTTPAccountResponse], []),
    use_access_point: IDL.Func(
      [IDL.Opt(IDL.Text)],
      [HTTPOneAccessPointResponse],
      [],
    ),
    validate_phone: IDL.Func([ValidatePhoneRequest], [Response], []),
    validate_signature: IDL.Func(
      [IDL.Opt(IDL.Text)],
      [IDL.Nat64, IDL.Opt(IDL.Text)],
      ["query"],
    ),
    verify_token: IDL.Func([Token], [Response], []),
    get_root_by_principal: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    add_email_and_principal_for_create_account_validation: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat64],
      [BoolHttpResponse],
      [],
    ),
    sync_recovery_phrase_from_internet_identity: IDL.Func(
      [IDL.Nat64],
      [HTTPAccountResponse],
      [],
    ),
    get_captcha: IDL.Func([], [Challenge], []),
  })
}
export const init = ({ IDL }: any) => {
  return []
}
