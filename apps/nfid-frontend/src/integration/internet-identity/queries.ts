import useSWRImmutable from "swr/immutable"

import {
  RootWallet,
  fetchPrincipals,
} from "@nfid/integration"

import {
  useAccounts,
  useProfile,
} from "frontend/integration/identity-manager/queries"

/**
 * React hook to retrieve user principals.
 */
export const useAllPrincipals = () => {
  const { profile } = useProfile()

  const { data: principals } = useSWRImmutable(
    profile?.anchor
      ? [
          BigInt(profile.anchor),
          [],
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
