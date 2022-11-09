export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    has_poap: IDL.Func([], [IDL.Bool], ["query"]),
    increment_poap: IDL.Func([], [], []),
    ping: IDL.Func([], [IDL.Bool], ["query"]),
  })
}
export const init = ({ IDL }: any) => {
  return []
}
