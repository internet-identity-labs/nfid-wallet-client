export const idlFactory = ({ IDL }) => {
  const ConfigurationRequest = IDL.Record({
    'key' : IDL.Vec(IDL.Nat8),
    'whitelisted_phone_numbers' : IDL.Opt(IDL.Vec(IDL.Text)),
    'lambda' : IDL.Principal,
    'token_refresh_ttl' : IDL.Nat64,
    'token_ttl' : IDL.Nat64,
  });
  const HTTPAccountRequest = IDL.Record({
    'token' : IDL.Text,
    'name' : IDL.Text,
    'anchor' : IDL.Nat64,
    'phone_number' : IDL.Text,
  });
  const PersonaIIResponse = IDL.Record({
    'domain' : IDL.Text,
    'anchor' : IDL.Nat64,
  });
  const PersonaNFIDResponse = IDL.Record({
    'domain' : IDL.Text,
    'persona_id' : IDL.Text,
  });
  const PersonaVariant = IDL.Variant({
    'ii_persona' : PersonaIIResponse,
    'nfid_persona' : PersonaNFIDResponse,
  });
  const AccountResponse = IDL.Record({
    'name' : IDL.Text,
    'anchor' : IDL.Nat64,
    'personas' : IDL.Vec(PersonaVariant),
    'principal_id' : IDL.Text,
    'phone_number' : IDL.Text,
  });
  const Error = IDL.Text;
  const HTTPAccountResponse = IDL.Record({
    'data' : IDL.Opt(AccountResponse),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const Application = IDL.Record({
    'user_limit' : IDL.Nat16,
    'domain' : IDL.Text,
    'name' : IDL.Text,
  });
  const HTTPApplicationResponse = IDL.Record({
    'data' : IDL.Opt(IDL.Vec(Application)),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const Name = IDL.Text;
  const BoolHttpResponse = IDL.Record({
    'data' : IDL.Opt(IDL.Bool),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const Domain = IDL.Text;
  const HTTPVerifyPhoneNumberRequest = IDL.Record({
    'token' : IDL.Text,
    'phone_number' : IDL.Text,
  });
  const HTTPPersonasResponse = IDL.Record({
    'data' : IDL.Opt(IDL.Vec(PersonaVariant)),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const HTTPAccountUpdateRequest = IDL.Record({ 'name' : IDL.Opt(IDL.Text) });
  const PhoneNumber = IDL.Text;
  return IDL.Service({
    'configure' : IDL.Func([ConfigurationRequest], [], []),
    'create_account' : IDL.Func(
        [HTTPAccountRequest],
        [HTTPAccountResponse],
        [],
      ),
    'create_application' : IDL.Func(
        [Application],
        [HTTPApplicationResponse],
        [],
      ),
    'create_persona' : IDL.Func([PersonaVariant], [HTTPAccountResponse], []),
    'delete_application' : IDL.Func([Name], [BoolHttpResponse], []),
    'get_account' : IDL.Func([], [HTTPAccountResponse], ['query']),
    'is_over_the_application_limit' : IDL.Func(
        [Domain],
        [BoolHttpResponse],
        ['query'],
      ),
    'post_token' : IDL.Func(
        [HTTPVerifyPhoneNumberRequest],
        [BoolHttpResponse],
        [],
      ),
    'read_applications' : IDL.Func([], [HTTPApplicationResponse], ['query']),
    'read_personas' : IDL.Func([], [HTTPPersonasResponse], []),
    'remove_account' : IDL.Func([], [BoolHttpResponse], []),
    'update_account' : IDL.Func(
        [HTTPAccountUpdateRequest],
        [HTTPAccountResponse],
        [],
      ),
    'validate_phone_number' : IDL.Func([PhoneNumber], [BoolHttpResponse], []),
  });
};
export const init = ({ IDL }) => { return []; };
