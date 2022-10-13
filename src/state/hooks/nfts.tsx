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
  const { principals } = useAllPrincipals()

  return useSWR(principals ? `userTokens` : null, () => {
    if (!principals) throw new Error("unreachable")
    console.debug(
      "Searched for NFTs at principals",
      principals.map((p) => [p.account, p.principal.toText()]),
    )
    return principalTokens(principals)
  })
}
