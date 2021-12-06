export const idlFactory = ({ IDL }) => {
  const HTTPAccountRequest = IDL.Record({
    'name' : IDL.Text,
    'email' : IDL.Text,
    'phone_number' : IDL.Text,
  });
  const Account = IDL.Record({
    'name' : IDL.Text,
    'email' : IDL.Text,
    'principal_id' : IDL.Text,
    'phone_number' : IDL.Text,
  });
  const Error = IDL.Text;
  const HTTPAccountResponse = IDL.Record({
    'data' : IDL.Opt(Account),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const Topic = IDL.Text;
  const Message = IDL.Text;
  const MessageHttpResponse = IDL.Record({
    'body' : IDL.Opt(IDL.Vec(Message)),
    'status_code' : IDL.Nat16,
  });
  const HTTPAccountUpdateRequest = IDL.Record({
    'name' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'phone_number' : IDL.Opt(IDL.Text),
  });
  const PhoneNumber = IDL.Text;
  const BoolHttpResponse = IDL.Record({
    'data' : IDL.Opt(IDL.Bool),
    'error' : IDL.Opt(Error),
    'status_code' : IDL.Nat16,
  });
  const Token = IDL.Text;
  return IDL.Service({
    'create_account' : IDL.Func(
        [HTTPAccountRequest],
        [HTTPAccountResponse],
        [],
      ),
    'create_topic' : IDL.Func([Topic], [MessageHttpResponse], []),
    'delete_topic' : IDL.Func([Topic], [MessageHttpResponse], []),
    'get_account' : IDL.Func([], [HTTPAccountResponse], ['query']),
    'get_messages' : IDL.Func([Topic], [MessageHttpResponse], []),
    'post_messages' : IDL.Func(
        [Topic, IDL.Vec(Message)],
        [MessageHttpResponse],
        [],
      ),
    'update_account' : IDL.Func(
        [HTTPAccountUpdateRequest],
        [HTTPAccountResponse],
        [],
      ),
    'verify_phone_number' : IDL.Func([PhoneNumber], [BoolHttpResponse], []),
    'verify_token' : IDL.Func([Token], [BoolHttpResponse], []),
  });
};
export const init = ({ IDL }) => { return []; };
