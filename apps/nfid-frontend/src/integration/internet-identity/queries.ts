import React from "react"
import useSWRImmutable from "swr/immutable"

import { extendWithFixedAccounts } from "@nfid/integration"

import { fetchPrincipals } from "frontend/integration/facade"
import {
  useAccounts,
  useApplicationsMeta,
  useProfile,
} from "frontend/integration/identity-manager/queries"

/**
 * React hook to retrieve user principals.
 */
export const useAllPrincipals = () => {
  const { profile } = useProfile()
  const { accounts } = useAccounts()
  const { applicationsMeta } = useApplicationsMeta()

  const allAccounts = React.useMemo(() => {
    return extendWithFixedAccounts(accounts, applicationsMeta)
  }, [accounts, applicationsMeta])

  const { data: principals } = useSWRImmutable(
    profile?.anchor && allAccounts
      ? [BigInt(profile.anchor), allAccounts]
      : null,
    fetchPrincipals,
    { dedupingInterval: 60_000, refreshInterval: 60_000 },
  )

  console.debug("useAllPrincipals", { principals })

  return { principals }
}
