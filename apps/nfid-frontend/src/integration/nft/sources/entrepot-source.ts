import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { decodeTokenIdentifier } from "src/integration/entrepot/ext"
import { MarketPlace } from "src/integration/nft/enum/enums"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

import { ttlCacheService } from "@nfid/client-db"

export const ENTREPOT_API =
  "https://us-central1-entrepot-api.cloudfunctions.net/api"
export const ENTREPOT_COLLECTIONS_CACHE_NAME = "ICP_NFT_ENTREPOT_COLLECTIONS"
const COLLECTIONS_TTL_MS = 24 * 60 * 60 * 1000

/** Entrepot standards that are EXT-compatible. */
const SUPPORTED_STANDARDS = new Set(["ext", "legacy", "legacy1.5"])

interface EntrepotCollectionRaw {
  id: string
  name: string
  standard?: string
}

export interface EntrepotCollectionInfo {
  name: string
  standard: string
}

interface EntrepotUserToken {
  id: string
  owner: string
  canister: string
  price: number
  time: number
}

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`Entrepot ${response.status}: ${url}`)
  }
  return (await response.json()) as T
}

export class EntrepotSource {
  /** Entrepot collections by canister id: only name and standard are kept. */
  getCollections(): Promise<Record<string, EntrepotCollectionInfo>> {
    return ttlCacheService.getOrFetch(
      ENTREPOT_COLLECTIONS_CACHE_NAME,
      async () => {
        const raw = await getJson<EntrepotCollectionRaw[]>(
          `${ENTREPOT_API}/collections`,
        )
        return Object.fromEntries(
          raw.map((c) => [
            c.id,
            { name: c.name.trim(), standard: c.standard ?? "" },
          ]),
        )
      },
      COLLECTIONS_TTL_MS,
    )
  }

  /** EXT and legacy NFTs owned by the principal's default account. */
  async getUserTokens(principal: Principal): Promise<IcpNftToken[]> {
    const accountId = AccountIdentifier.fromPrincipal({ principal }).toHex()
    const [tokens, collections] = await Promise.all([
      getJson<EntrepotUserToken[]>(`${ENTREPOT_API}/user/${accountId}/all`),
      this.getCollections(),
    ])

    return tokens.flatMap((token): IcpNftToken[] => {
      const collection = collections[token.canister]
      if (!collection || !SUPPORTED_STANDARDS.has(collection.standard)) {
        return []
      }
      let index: number
      try {
        index = decodeTokenIdentifier(token.id).index
      } catch {
        return []
      }
      return [
        {
          marketPlace: MarketPlace.EXT,
          tokenId: token.id,
          tokenNumber: index,
          collectionId: token.canister,
          collectionName: collection.name,
          millis: token.time ? Math.floor(token.time / 1_000_000) : 0,
        },
      ]
    })
  }
}

export const entrepotSource = new EntrepotSource()
