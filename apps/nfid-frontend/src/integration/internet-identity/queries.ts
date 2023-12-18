import useSWRImmutable from "swr/immutable"

import { fetchPrincipals } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"

/**
 * React hook to retrieve user principals.
 */
export const useAllPrincipals = () => {
  const { profile } = useProfile()

  const { data: principals } = useSWRImmutable(
    profile?.anchor ? "allPrincipals" : null,
    fetchPrincipals,
    { dedupingInterval: 60_000, refreshInterval: 60_000 },
  )

  console.debug("useAllPrincipals", { principals })

  return { principals }
}
