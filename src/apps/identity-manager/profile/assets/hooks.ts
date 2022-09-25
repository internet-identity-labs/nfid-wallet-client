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
import { useProfile } from "frontend/integration/identity-manager/queries"

export function useNFT(tokenId: string) {
  const { canister } = decodeTokenIdentifier(tokenId)
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
    _collection.data && _tokens.data ? `token/${tokenId}` : null,
    () => {
      if (!_collection.data || !_tokens.data) throw new Error("unreachable")
      return _tokens.data.find((token) => token.tokenId === tokenId)
    },
  )
}

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

  return useSWR(principals?.data ? `userTokens` : null, () => {
    if (!principals.data) throw new Error("unreachable")
    return principalTokens(principals.data)
  })
}
