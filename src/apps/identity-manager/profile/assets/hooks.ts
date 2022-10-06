import { decodeTokenIdentifier } from "ictool"
import useSWR from "swr"

import {
  principalTokens,
  collection,
  tokens,
  token,
} from "frontend/integration/entrepot"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

export function useNFT(tokenId: string) {
  const { canister } = decodeTokenIdentifier(tokenId)
  const _collection = useSWR(
    `collection/${canister}`,
    () => collection(canister),
    {
      dedupingInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )

  const _tokens = useSWR(
    _collection.data ? `collection/${canister}/tokens` : null,
    () => {
      if (!_collection.data) throw new Error("unreachable")
      return tokens(_collection.data)
    },
    {
      dedupingInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )

  return useSWR(
    _collection.data && _tokens.data ? `token/${tokenId}` : null,
    () => {
      if (!_collection.data || !_tokens.data) throw new Error("unreachable")
      const { index } = decodeTokenIdentifier(tokenId)
      return token(_collection.data, _tokens.data, index)
    },
    {
      dedupingInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )
}

export const useAllNFTs = () => {
  const { principals } = useAllPrincipals()

  return useSWR(principals ? `userTokens` : null, () => {
    if (!principals) throw new Error("unreachable")
    return principalTokens(principals)
  })
}
