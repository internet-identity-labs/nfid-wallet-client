import { Actor, HttpAgent } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"

import { ttlCacheService } from "@nfid/client-db"

export const EXT_FLOOR_PRICE_CACHE_NAME = "ICP_NFT_EXT_FLOOR_"
const FLOOR_TTL_MS = 60 * 60 * 1000

/** EXT `stats`: (volume, highest, lowest, floor, listings, supply, sales). */
type ExtStats = [bigint, bigint, bigint, bigint, bigint, bigint, bigint]

interface ExtStatsActor {
  stats: () => Promise<ExtStats>
}

const statsIdl: IDL.InterfaceFactory = ({ IDL: I }) =>
  I.Service({
    stats: I.Func(
      [],
      [I.Nat64, I.Nat64, I.Nat64, I.Nat64, I.Nat, I.Nat, I.Nat],
      ["query"],
    ),
  })

let agent: Promise<HttpAgent> | undefined
const getAgent = () => (agent ??= HttpAgent.create({ host: IC_HOST }))

export class ExtFloorPriceService {
  /** Floor price in e8s, or undefined when unknown, unlisted or failing. */
  async getFloorPrice(collectionId: string): Promise<number | undefined> {
    const floor = await ttlCacheService.getOrFetch<number | null>(
      `${EXT_FLOOR_PRICE_CACHE_NAME}${collectionId}`,
      () => this.fetchFloor(collectionId),
      FLOOR_TTL_MS,
    )
    return floor ?? undefined
  }

  private async fetchFloor(collectionId: string): Promise<number | null> {
    try {
      const actor = Actor.createActor<ExtStatsActor>(statsIdl, {
        agent: await getAgent(),
        canisterId: collectionId,
      })
      const stats = await actor.stats()
      const floor = Number(stats[3])
      return floor > 0 ? floor : null
    } catch (e) {
      console.warn(`EXT stats() failed for ${collectionId}`, e)
      return null
    }
  }
}

export const extFloorPriceService = new ExtFloorPriceService()
