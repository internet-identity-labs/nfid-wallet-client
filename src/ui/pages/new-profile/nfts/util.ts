import {
  EntrepotCollection,
  UserNFTDetails,
} from "frontend/integration/entrepot/types"
import { Account } from "frontend/integration/identity-manager"

import { GlauberTS } from "./search"

export function sortUserTokens(tokens: UserNFTDetails[]) {
  return tokens.sort((a, b) => a.index - b.index)
}

export function filterUserTokens(
  tokens: UserNFTDetails[],
  filters: {
    search?: string
  },
) {
  let result = tokens
  if (filters.search) {
    result = tokens.filter((token) =>
      GlauberTS.containsDeep(filters.search as string)(token),
    )
  }
  return result
}

export function userTokensByWallet(tokens: UserNFTDetails[]) {
  return tokens.reduce<{
    [key: string]: {
      tokens: UserNFTDetails[]
      account: Account
      principal: string
    }
  }>(
    (agg, token) => ({
      ...agg,
      [token.principal.toText()]: {
        tokens: [...(agg[token.principal.toText()]?.tokens || []), token],
        account: token.account,
        principal: token.principal.toText(),
      },
    }),
    {},
  )
}

export function userTokensByCollection(tokens: UserNFTDetails[]) {
  return tokens.reduce<{
    [key: string]: {
      tokens: UserNFTDetails[]
      collection: EntrepotCollection
    }
  }>(
    (agg, token) => ({
      ...agg,
      [token.collection.id]: {
        tokens: [...(agg[token.collection.id]?.tokens || []), token],
        collection: token.collection,
      },
    }),
    {},
  )
}
