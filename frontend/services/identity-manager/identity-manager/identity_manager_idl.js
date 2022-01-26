export const idlFactory = ({ IDL }) => {
  const Configuration = IDL.Record({
    lambda: IDL.Principal,
    token_ttl: IDL.Nat64,
  })
  const HTTPAccountRequest = IDL.Record({
    token: IDL.Text,
    name: IDL.Text,
    phone_number: IDL.Text,
  })
  const PersonaIIResponse = IDL.Record({
    domain: IDL.Text,
    anchor: IDL.Text,
  })
  const PersonaNFIDResponse = IDL.Record({
    domain: IDL.Text,
    persona_id: IDL.Text,
  })
  const PersonaVariant = IDL.Variant({
    ii_persona: PersonaIIResponse,
    nfid_persona: PersonaNFIDResponse,
  })
  const Device = IDL.Record({
    model: IDL.Text,
    pub_key_hash: IDL.Text,
    make: IDL.Text,
    browser: IDL.Text,
    last_used: IDL.Text,
  })
  const AccountResponse = IDL.Record({
    name: IDL.Text,
    personas: IDL.Vec(PersonaVariant),
    principal_id: IDL.Text,
    phone_number: IDL.Text,
    devices: IDL.Vec(Device),
  })
  const Error = IDL.Text
  const HTTPAccountResponse = IDL.Record({
    data: IDL.Opt(AccountResponse),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const BoolHttpResponse = IDL.Record({
    data: IDL.Opt(IDL.Bool),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const HTTPVerifyPhoneNumberRequest = IDL.Record({
    token: IDL.Text,
    phone_number: IDL.Text,
  })
  const HTTPDeviceResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(Device)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const HTTPPersonasResponse = IDL.Record({
    data: IDL.Opt(IDL.Vec(PersonaVariant)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  const HTTPAccountUpdateRequest = IDL.Record({ name: IDL.Opt(IDL.Text) })
  return IDL.Service({
    configure: IDL.Func([Configuration], [], []),
    create_account: IDL.Func([HTTPAccountRequest], [HTTPAccountResponse], []),
    create_device: IDL.Func([Device], [BoolHttpResponse], []),
    create_persona: IDL.Func([PersonaVariant], [HTTPAccountResponse], []),
    get_account: IDL.Func([], [HTTPAccountResponse], ["query"]),
    post_token: IDL.Func(
      [HTTPVerifyPhoneNumberRequest],
      [BoolHttpResponse],
      [],
    ),
    read_devices: IDL.Func([], [HTTPDeviceResponse], []),
    read_personas: IDL.Func([], [HTTPPersonasResponse], []),
    update_account: IDL.Func(
      [HTTPAccountUpdateRequest],
      [HTTPAccountResponse],
      [],
    ),
  })
}
export const init = ({ IDL }) => {
  return []
}
