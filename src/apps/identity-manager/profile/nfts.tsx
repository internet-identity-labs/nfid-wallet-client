import { decodeTokenIdentifier } from "ictool"
import useSWR from "swr"

import {
  principalTokens,
  collection,
  tokens,
} from "frontend/integration/entrepot"
import { fetchPrincipals } from "frontend/integration/facade"
import {
  fetchAccounts,
  fetchApplications,
} from "frontend/integration/identity-manager"
import {
  useApplicationsMeta,
  useProfile,
} from "frontend/integration/identity-manager/queries"
import ProfileNFTsPage from "frontend/ui/pages/new-profile/nfts"

export function useNFT(tokenid: string) {
  const { canister } = decodeTokenIdentifier(tokenid)
  const _collection = useSWR(`collection/${canister}`, () =>
    collection(canister),
  )
  const _tokens = useSWR(
    _collection.data ? `collection/${canister}/tokens` : null,
    () => {
      if (!_collection.data) throw new Error("unreachable")
      return tokens(_collection.data)
    },
  )
  return useSWR(
    _collection.data && _tokens.data ? `token/${tokenid}` : null,
    () => {
      if (!_collection.data || !_tokens.data) throw new Error("unreachable")
      return _tokens.data.find((token) => token.tokenId === tokenid)
    },
  )
}

export function useAllNFTs() {
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
    console.debug(
      "Searched for NFTs at principals",
      principals.data.map((p) => [p.account, p.principal.toText()]),
    )
    return principalTokens(principals.data)
  })
}

const ProfileNFTs = () => {
  const tokens = useAllNFTs()
  const applications = useApplicationsMeta()
  return (
    <ProfileNFTsPage
      isLoading={!tokens.data || applications.isLoading}
      tokens={tokens.data || []}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileNFTs
