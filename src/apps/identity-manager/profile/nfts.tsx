import useSWR from "swr"

import { principalTokens } from "frontend/integration/entrepot"
import { fetchPrincipals } from "frontend/integration/facade"
import {
  fetchAccounts,
  fetchApplications,
} from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"
import ProfileNFTsPage from "frontend/ui/pages/new-profile/nfts"

const ProfileNFTs = () => {
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
  const tokens = useSWR(principals?.data ? `userTokers` : null, () => {
    if (!principals.data) throw new Error("unreachable")
    console.debug(
      "Searched for NFTs at principals",
      principals.data.map((p) => [p.account, p.principal.toText()]),
    )
    return principalTokens(principals.data)
  })
  return <ProfileNFTsPage isLoading={!tokens.data} tokens={tokens.data || []} />
}

export default ProfileNFTs
