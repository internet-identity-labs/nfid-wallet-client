export const idlFactory = ({ IDL }: any) => {
  const Topic = IDL.Text
  const Message = IDL.Text
  const Error = IDL.Text
  const MessageHttpResponse = IDL.Record({
    body: IDL.Opt(IDL.Vec(Message)),
    error: IDL.Opt(Error),
    status_code: IDL.Nat16,
  })
  return IDL.Service({
    create_topic: IDL.Func([Topic], [MessageHttpResponse], []),
    delete_topic: IDL.Func([Topic], [MessageHttpResponse], []),
    get_messages: IDL.Func([Topic], [MessageHttpResponse], []),
    ping: IDL.Func([], [], ["query"]),
    post_messages: IDL.Func(
      [Topic, IDL.Vec(Message)],
      [MessageHttpResponse],
      [],
    ),
  })
}
export const init = ({ IDL: _IDL }: any) => {
  return []
}
