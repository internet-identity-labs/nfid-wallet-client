import useSWR from "swr"

import { principalTokens } from "frontend/integration/entrepot"
import { fetchPrincipals } from "frontend/integration/facade"
import {
  fetchAccounts,
  fetchApplications,
} from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"

export const useAllNFTs = () => {
  const { profile } = useProfile()

  const accounts = useSWR(`accounts`, fetchAccounts)
  const applications = useSWR(`applications`, () => {
    return fetchApplications().then((r) => r.filter((app) => app.isNftStorage))
  })

  const principals = useSWR(
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

  return useSWR(principals?.data ? `userTokers` : null, () => {
    if (!principals.data) throw new Error("unreachable")
    console.log(principals.data)
    // @ts-ignore
    return principalTokens(principals.data)
    // return principalTokens([
    //   {
    //     principal: Principal.fromText(
    //       "fxbar-soekq-nqxzb-qnjbd-6i5ms-oy4od-3an3t-4e3jq-gka7c-dcecn-uae",
    //     ),
    //     account: accounts.data ? accounts.data[0] : ({} as any),
    //   },
    // ])
  })
}
