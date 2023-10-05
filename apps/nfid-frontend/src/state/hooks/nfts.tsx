import { decodeTokenIdentifier } from "ictool"
import useSWR from "swr"

import {
  principalTokens,
  collection,
  tokens,
} from "frontend/integration/entrepot"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

export function useNFT(tokenid: string) {
  const { canister } = decodeTokenIdentifier(tokenid)
  const _collection = useSWR(
    `collection/${canister}`,
    () => collection(canister),
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
    },
  )
  const _tokens = useSWR(
    _collection.data ? `collection/${canister}/tokens` : null,
    () => {
      if (!_collection.data) throw new Error("unreachable")
      return tokens(_collection.data)
    },
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
    },
  )
  return useSWR(
    _collection.data && _tokens.data ? `token/${tokenid}` : null,
    () => {
      if (!_collection.data || !_tokens.data) throw new Error("unreachable")
      return _tokens.data.find((token) => token.tokenId === tokenid)
    },
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
    },
  )
}

export function useAllNFTs() {
  const { principals } = useAllPrincipals()

  return useSWR(
    principals ? [principals, "userTokens"] : null,
    ([principals]) => principalTokens(principals),
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
    },
  )
}
