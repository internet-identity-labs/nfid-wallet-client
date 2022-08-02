import useSWR from "swr"

<<<<<<< HEAD:src/integration/internet-identity/queries.ts
import { fetchPrincipal } from "."

=======
import { fetchPrincipal } from "../actors/ii"

/**
 * React hook to retrieve user principal for given anchor and scope.
 */
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/hooks/ii.ts
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
