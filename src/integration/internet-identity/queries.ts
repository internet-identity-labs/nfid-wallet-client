import useSWRImmutable from "swr/immutable"

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

  const { data: principals } = useSWRImmutable(
    profile?.anchor && accounts && applicationsMeta
      ? [BigInt(profile.anchor), accounts, applicationsMeta]
      : null,
    fetchPrincipals,
  )
  return { principals }
}
