import {
  EntrepotCollection,
  UserNFTDetails,
} from "frontend/integration/entrepot/types"
import { Account, Application } from "frontend/integration/identity-manager"

import { GlauberTS } from "./search"

const sortFuncs: {
  [key: string]: (a: UserNFTDetails, b: UserNFTDetails) => number
} = {
  "Token #": (a, b) => a.index - b.index,
  Wallet: (a, b) =>
    a.account.label.toLowerCase() < b.account.label.toLowerCase() ? -1 : 1,
  Collection: (a, b) =>
    a.collection.name.toLowerCase() < b.collection.name.toLowerCase() ? -1 : 1,
  default: () => 0,
}

export function sortUserTokens(
  tokens: UserNFTDetails[],
  fields: string[] = ["Token #"],
) {
  // return [...fields]
  //   .reverse()
  //   .reduce((agg, field) => agg.sort(sortFuncs[field] || defaultSort), tokens)
  const func = sortFuncs[fields[0]]
  if (!func) console.warn(`Unknown sort method ${fields[0]}`)
  return tokens.sort(func || sortFuncs.default)
}

export function filterUserTokens(
  tokens: UserNFTDetails[],
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

export function GetWalletName(
  applications: Application[],
  domain: string,
  accountId: number | string,
) {
  if (!applications) return ""

  return `${
    applications.find((x) => x.domain === domain)?.name ?? "NFID"
  } account ${Number(accountId) + 1}`
}
