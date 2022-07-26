export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    has_poap: IDL.Func([], [IDL.Bool], ["query"]),
    increment_poap: IDL.Func([], [], []),
    ping: IDL.Func([], [IDL.Bool], ["query"]),
  })
}
export const init = ({ IDL }) => {
  return []
}
