export const idlFactory = ({ IDL }) => {
  const ConfigurationRequest = IDL.Record({
    env: IDL.Opt(IDL.Text),
    whitelisted_phone_numbers: IDL.Opt(IDL.Vec(IDL.Text)),
    backup_canister_id: IDL.Opt(IDL.Text),
    ii_canister_id: IDL.Opt(IDL.Principal),
    whitelisted_canisters: IDL.Opt(IDL.Vec(IDL.Principal)),
    lambda: IDL.Principal,
    token_refresh_ttl: IDL.Nat64,
    heartbeat: IDL.Opt(IDL.Nat32),
    token_ttl: IDL.Nat64,
  })
  const AccessPointRequest = IDL.Record({ pub_key: IDL.Vec(IDL.Nat8) })
  const AccessPoint = IDL.Record({ principal_id: IDL.Text })
  const Error = IDL.Text
  const HTTPAccessPointResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(AccessPoint)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const HTTPAccountRequest = IDL.Record({ anchor: IDL.Nat64 })
  const PersonaResponse = IDL.Record({
    domain: IDL.Text,
    persona_id: IDL.Text,
  })
  const AccountResponse = IDL.Record({
    name: IDL.Opt(IDL.Text),
    anchor: IDL.Nat64,
    access_points: IDL.Vec(AccessPoint),
    personas: IDL.Vec(PersonaResponse),
    principal_id: IDL.Text,
    phone_number: IDL.Opt(IDL.Text),
  })
  const HTTPAccountResponse = IDL.Record({
    data: IDL.Opt(AccountResponse),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const Application = IDL.Record({
    user_limit: IDL.Nat16,
    domain: IDL.Text,
    name: IDL.Text,
  })
  const HTTPApplicationResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(Application)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const PersonaRequest = IDL.Record({
    domain: IDL.Text,
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
  const LogLevel = IDL.Variant({ INFO: IDL.Null, ERROR: IDL.Null })
  const Log = IDL.Record({
    log: IDL.Text,
    level: LogLevel,
    timestamp: IDL.Nat64,
  })
  const TokenRequest = IDL.Record({
    token: IDL.Text,
    principal_id: IDL.Text,
    phone_number: IDL.Text,
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
  const BasicEntity = IDL.Record({
    modified_date: IDL.Nat64,
    created_date: IDL.Nat64,
  })
  const Persona = IDL.Record({
    domain: IDL.Text,
    basic_entity: BasicEntity,
    persona_id: IDL.Text,
  })
  const Account = IDL.Record({
    name: IDL.Opt(IDL.Text),
    anchor: IDL.Nat64,
    access_points: IDL.Vec(AccessPoint),
    basic_entity: BasicEntity,
    personas: IDL.Vec(Persona),
    principal_id: IDL.Text,
    phone_number: IDL.Opt(IDL.Text),
  })
  const HTTPAccountUpdateRequest = IDL.Record({ name: IDL.Opt(IDL.Text) })
  const ValidatePhoneRequest = IDL.Record({
    principal_id: IDL.Text,
    phone_number: IDL.Text,
  })
  const Token = IDL.Text
  return IDL.Service({
    configure: IDL.Func([ConfigurationRequest], [], []),
    create_access_point: IDL.Func(
      [AccessPointRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    create_account: IDL.Func([HTTPAccountRequest], [HTTPAccountResponse], []),
    create_application: IDL.Func([Application], [HTTPApplicationResponse], []),
    create_persona: IDL.Func([PersonaRequest], [HTTPAccountResponse], []),
    credentials: IDL.Func([], [CredentialResponse], []),
    delete_application: IDL.Func([IDL.Text], [BoolHttpResponse], []),
    get_account: IDL.Func([], [HTTPAccountResponse], ["query"]),
    get_all_logs: IDL.Func([], [IDL.Vec(Log)], []),
    get_logs: IDL.Func([IDL.Nat64], [IDL.Vec(Log)], []),
    is_over_the_application_limit: IDL.Func(
      [IDL.Text],
      [BoolHttpResponse],
      ["query"],
    ),
    lookup: IDL.Func([IDL.Nat64], [IDL.Vec(IDL.Principal), IDL.Principal], []),
    post_token: IDL.Func([TokenRequest], [Response], []),
    read_access_points: IDL.Func([], [HTTPAccessPointResponse], []),
    read_applications: IDL.Func([], [HTTPApplicationResponse], ["query"]),
    read_personas: IDL.Func([], [HTTPPersonasResponse], ["query"]),
    remove_access_point: IDL.Func(
      [AccessPointRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    remove_account: IDL.Func([], [BoolHttpResponse], []),
    restore_accounts: IDL.Func([IDL.Text], [BoolHttpResponse], []),
    store_accounts: IDL.Func([IDL.Vec(Account)], [BoolHttpResponse], []),
    update_account: IDL.Func(
      [HTTPAccountUpdateRequest],
      [HTTPAccountResponse],
      [],
    ),
    validate_phone: IDL.Func([ValidatePhoneRequest], [Response], []),
    verify_token: IDL.Func([Token], [Response], []),
  })
}
export const init = ({ IDL }) => {
  return []
}
