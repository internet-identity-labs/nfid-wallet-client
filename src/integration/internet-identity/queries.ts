import useSWR from "swr"

import { fetchPrincipal } from "."

export function usePrincipal(anchor: number, salt: string) {
  return useSWR(`principal/${anchor}/${salt}`, () =>
    fetchPrincipal(anchor, salt),
  )
}

export function usePrincipals(data: { anchor: number; salt: string }[]) {
  return useSWR(`principals`, () => {
    return Promise.all(data.map((x) => fetchPrincipal(x.anchor, x.salt)))
  })
}
