import React from "react"
import useSWRImmutable from "swr/immutable"

import {
  RootWallet,
  extendWithFixedAccounts,
  fetchPrincipals,
} from "@nfid/integration"

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
      ? [
          BigInt(profile.anchor),
          allAccounts,
          profile.wallet === RootWallet.NFID,
        ]
      : null,
    ([anchor, allAccounts, isNewUser]) =>
      fetchPrincipals(anchor, allAccounts, isNewUser),
    { dedupingInterval: 60_000, refreshInterval: 60_000 },
  )

  console.debug("useAllPrincipals", { principals })

  return { principals }
}
