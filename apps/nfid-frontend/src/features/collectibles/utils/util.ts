import { Account } from "@nfid/integration"

import {
  NonFungibleCollection,
  UserNonFungibleToken,
} from "frontend/features/non-fungible-token/types"
import { NFT } from "frontend/integration/nft/nft"

import { GlauberTS } from "./search"

const sortFuncs: {
  [key: string]: (a: UserNonFungibleToken, b: UserNonFungibleToken) => number
} = {
  "Token #": (a, b) => Number(a.index) - Number(b.index),
  Wallet: (a, b) =>
    a.account.label.toLowerCase() < b.account.label.toLowerCase() ? -1 : 1,
  Collection: (a, b) =>
    a.collection.name.toLowerCase() < b.collection.name.toLowerCase() ? -1 : 1,
  default: () => 0,
}

export function sortUserTokens(
  tokens: UserNonFungibleToken[],
  fields: string[] = ["Token #"],
) {
  const func = sortFuncs[fields[0]]
  if (!func) console.warn(`Unknown sort method ${fields[0]}`)
  return tokens.sort(func || sortFuncs.default)
}

export function filterUserTokens(
  tokens: NFT[],
  filters: {
    search?: string
  },
) {
  let result = tokens
  if (filters.search) {
    const search = filters.search
    result = tokens.filter((token) => GlauberTS.containsDeep(search)(token))
  }
  return result
}

export function userTokensByWallet(tokens: UserNonFungibleToken[]) {
  return tokens.reduce<{
    [key: string]: {
      tokens: UserNonFungibleToken[]
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

export function userTokensByCollection(tokens: UserNonFungibleToken[]) {
  return tokens.reduce<{
    [key: string]: {
      tokens: UserNonFungibleToken[]
      collection: NonFungibleCollection
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
