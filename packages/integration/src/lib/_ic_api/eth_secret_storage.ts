export const idlFactory = ({ IDL }: any) => {
  const Address = IDL.Text;
  const Signature = IDL.Text;
  const Secret = IDL.Text;
  return IDL.Service({
    'get_secret' : IDL.Func([Address, Signature], [Secret], ['query']),
    'init' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }: any) => { return []; };
