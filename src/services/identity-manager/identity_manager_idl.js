export const idlFactory = ({ IDL }) => {
  const ConfigurationRequest = IDL.Record({
    key: IDL.Vec(IDL.Nat8),
    whitelisted_phone_numbers: IDL.Opt(IDL.Vec(IDL.Text)),
    lambda: IDL.Principal,
    token_refresh_ttl: IDL.Nat64,
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
  const PersonaIIResponse = IDL.Record({
    domain: IDL.Text,
    anchor: IDL.Nat64,
  })
  const PersonaNFIDResponse = IDL.Record({
    domain: IDL.Text,
    persona_id: IDL.Text,
  })
  const PersonaVariant = IDL.Variant({
    ii_persona: PersonaIIResponse,
    nfid_persona: PersonaNFIDResponse,
  })
  const AccountResponse = IDL.Record({
    name: IDL.Opt(IDL.Text),
    anchor: IDL.Nat64,
    access_points: IDL.Vec(AccessPoint),
    personas: IDL.Vec(PersonaVariant),
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
  const Name = IDL.Text
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
  const Domain = IDL.Text
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
    data: IDL.Opt(IDL.Vec(PersonaVariant)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
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
    create_persona: IDL.Func([PersonaVariant], [HTTPAccountResponse], []),
    delete_application: IDL.Func([Name], [BoolHttpResponse], []),
    get_account: IDL.Func([], [HTTPAccountResponse], ["query"]),
    get_all_logs: IDL.Func([], [IDL.Vec(Log)], []),
    get_logs: IDL.Func([IDL.Nat64], [IDL.Vec(Log)], []),
    is_over_the_application_limit: IDL.Func(
      [Domain],
      [BoolHttpResponse],
      ["query"],
    ),
    post_token: IDL.Func([TokenRequest], [Response], []),
    read_access_points: IDL.Func([], [HTTPAccessPointResponse], []),
    read_applications: IDL.Func([], [HTTPApplicationResponse], ["query"]),
    read_personas: IDL.Func([], [HTTPPersonasResponse], []),
    remove_access_point: IDL.Func(
      [AccessPointRequest],
      [HTTPAccessPointResponse],
      [],
    ),
    remove_account: IDL.Func([], [BoolHttpResponse], []),
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
