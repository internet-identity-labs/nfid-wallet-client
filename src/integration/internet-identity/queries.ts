import useSWR from "swr"

import { fetchPrincipal } from "."

/**
 * React hook to retrieve user principal for given anchor and scope.
 */
export function usePrincipal(anchor: number, salt: string) {
  return useSWR(`principal/${anchor}/${salt}`, () =>
    fetchPrincipal(anchor, salt),
  )
}

/**
 * React hook to retrieve user principal given a list of anchors and scopes.
 */
export function usePrincipals(data: { anchor: number; salt: string }[]) {
  return useSWR(`principals`, () => {
    return Promise.all(data.map((x) => fetchPrincipal(x.anchor, x.salt)))
  })
}
