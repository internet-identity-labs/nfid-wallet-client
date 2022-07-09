import useSWR from "swr"

import { ii } from "./actors"

// TODO: Create fetch methods needed in the phone number credential flow
// - [ ] prepare_delegation
// - [ ] get_delegation

/**
 * Retrieve user's principal for a domain + persona hash.
 * @param anchor
 * @param salt
 */
export function fetchPrincipal(anchor: number, salt: string) {
  return ii.get_principal(BigInt(anchor), salt)
}

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
