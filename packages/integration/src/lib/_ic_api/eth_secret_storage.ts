export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    'configure' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'secret_by_signature' : IDL.Func([IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }: any) => { return []; };
