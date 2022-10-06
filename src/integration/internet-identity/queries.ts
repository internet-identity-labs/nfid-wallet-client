import useSWR from "swr"

import { fetchPrincipals } from "frontend/integration/facade"
import {
  fetchAccounts,
  fetchApplications,
} from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"

/**
 * React hook to retrieve user principals.
 */
export const useAllPrincipals = () => {
  const { profile } = useProfile()

  const accounts = useSWR(`accounts`, fetchAccounts)
  const applications = useSWR(`applications`, () => {
    return fetchApplications().then((r) => r.filter((app) => app.isNftStorage))
  })

  const { data: principals } = useSWR(
    profile?.anchor && accounts?.data && applications.data
      ? [BigInt(profile.anchor), accounts.data, applications.data]
      : null,
    fetchPrincipals,
  )
  return { principals }
}
