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
      ? `principals${profile.anchor}`
      : null,
    () => {
      if (!profile || !accounts.data || !applications.data)
        throw new Error("Unreachable")

      return fetchPrincipals(
        BigInt(profile.anchor),
        accounts.data,
        applications.data,
      )
    },
  )
  return { principals }
}
