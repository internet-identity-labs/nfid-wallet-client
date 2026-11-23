import { Principal } from "@icp-sdk/core/principal"
import { MarketPlace } from "src/integration/nft/enum/enums"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

import { ttlCacheService } from "@nfid/client-db"
import {
  icrc7RegistryService,
  marketplaceService,
  NftCollection,
} from "@nfid/integration/marketplace"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

export const ICRC7_NFT_COLLECTIONS_CACHE_NAME = "ICP_NFT_ICRC7_COLLECTIONS"
export const ICRC7_FLOOR_PRICE_CACHE_NAME = "ICP_NFT_ICRC7_FLOOR_"
const COLLECTIONS_TTL_MS = 60 * 60 * 1000
const FLOOR_TTL_MS = 60 * 60 * 1000
const PAGE_SIZE = BigInt(100)
const CONCURRENCY = 8

type MetadataValue = { Text: string } | Record<string, unknown>
type CachedCollection = Pick<NftCollection, "canisterId" | "name" | "logo">

const metaText = (
  meta: Array<[string, MetadataValue]>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = meta.find(([k]) => k === key)?.[1]
    if (value && "Text" in value && typeof value.Text === "string") {
      if (value.Text) return value.Text
    }
  }
  return undefined
}

/** Runs `fn` over `items`, at most `limit` at a time. */
const mapLimited = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  )
  return results
}

export class Icrc7Source {
  /**
   * Oracle collections without Spam and Hidden ones. With `hideInactive`, the
   * collections the signed-in user set Inactive are left out too.
   */
  async getCollections(hideInactive: boolean): Promise<CachedCollection[]> {
    const collections = await ttlCacheService.getOrFetch<CachedCollection[]>(
      ICRC7_NFT_COLLECTIONS_CACHE_NAME,
      async () =>
        (await marketplaceService.getCollections())
          .filter((c) => c.status !== "Spam" && c.status !== "Hidden")
          .map(({ canisterId, name, logo }) => ({ canisterId, name, logo })),
      COLLECTIONS_TTL_MS,
    )
    if (!hideInactive) return collections

    const inactive = new Set(
      (await icrc7RegistryService.getStoredCollections())
        .filter((c) => c.state === State.Inactive)
        .map((c) => c.canisterId),
    )
    return collections.filter((c) => !inactive.has(c.canisterId))
  }

  /**
   * ICRC-7 NFTs of the principal's default account. A collection that fails is
   * skipped and logged.
   */
  async getUserTokens(
    principal: Principal,
    hideInactive: boolean,
  ): Promise<IcpNftToken[]> {
    const collections = await this.getCollections(hideInactive)
    const perCollection = await mapLimited(
      collections,
      CONCURRENCY,
      (collection) =>
        this.getCollectionTokens(collection, principal).catch((e) => {
          console.error(
            `ICRC-7 tokens failed for collection ${collection.canisterId}`,
            e,
          )
          return []
        }),
    )
    return perCollection.flat()
  }

  /** Lowest price of an active listing in e8s, or undefined. */
  async getFloorPrice(collectionId: string): Promise<number | undefined> {
    const floor = await ttlCacheService.getOrFetch<number | null>(
      `${ICRC7_FLOOR_PRICE_CACHE_NAME}${collectionId}`,
      async () => {
        try {
          const page = await marketplaceService.getListings({
            collectionId,
            sort: "PriceAsc",
          })
          const active = page.items.filter((l) => l.status === "Active")
          if (!active.length) return null
          return Number(
            active.reduce(
              (min, l) => (l.priceE8s < min ? l.priceE8s : min),
              active[0].priceE8s,
            ),
          )
        } catch (e) {
          console.warn(`ICRC-7 listings failed for ${collectionId}`, e)
          return null
        }
      },
      FLOOR_TTL_MS,
    )
    return floor ?? undefined
  }

  private async getCollectionTokens(
    collection: CachedCollection,
    principal: Principal,
  ): Promise<IcpNftToken[]> {
    const ids: bigint[] = []
    let prev: bigint | undefined
    for (;;) {
      const page = await marketplaceService.getOwnedTokenIds(
        collection.canisterId,
        principal,
        { prev, take: PAGE_SIZE },
      )
      ids.push(...page)
      if (page.length < Number(PAGE_SIZE)) break
      prev = page[page.length - 1]
    }
    if (!ids.length) return []

    const [metadata, floor] = await Promise.all([
      marketplaceService.getTokenMetadata(collection.canisterId, ids),
      this.getFloorPrice(collection.canisterId),
    ])

    return ids.map((id) => {
      const meta = (metadata.get(id) ?? []) as Array<[string, MetadataValue]>
      return {
        marketPlace: MarketPlace.ICRC7,
        tokenId: `${collection.canisterId}:${id}`,
        tokenNumber: Number(id),
        collectionId: collection.canisterId,
        collectionName: collection.name,
        millis: 0,
        tokenFloorPriceIcp: floor,
        name: metaText(meta, ["icrc7:name", "name", "icrc97:name"]),
        image: metaText(meta, [
          "icrc7:image",
          "image",
          "icrc7:thumbnail",
          "thumbnail",
        ]),
        description: metaText(meta, ["icrc7:description", "description"]),
        collectionLogo: collection.logo,
      }
    })
  }
}

export const icrc7Source = new Icrc7Source()
