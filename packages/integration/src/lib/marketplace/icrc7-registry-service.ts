import { storageWithTtl, ttlCacheService } from "@nfid/client-db"

import { ICRC7Collection } from "../_ic_api/user_registry.d"
import { userRegistry } from "../actors"
import { authState } from "../authentication"
import { State } from "../token/icrc1/enum/enums"

export const ICRC7_REGISTRY_CACHE_NAME = "Icrc7RegistryService.getCollections"
const CACHE_TTL_MS = 30 * 1000

export interface UserIcrc7Collection {
  canisterId: string
  state: State
}

/**
 * ICRC-7 collections the user added to the wallet, with their state:
 * Active shows a collection, Inactive hides it. Stored in user_registry per
 * user root, like ICRC-1 tokens (see Icrc1RegistryService).
 */
export class Icrc7RegistryService {
  async getStoredCollections(): Promise<UserIcrc7Collection[]> {
    const root = authState.getUserIdData().userId
    return ttlCacheService.getOrFetch(
      await this.getCacheName(),
      async () =>
        (await userRegistry.get_icrc7_collections_by_root(root)).map(
          mapCollection,
        ),
      CACHE_TTL_MS,
    )
  }

  /** Adds the collection or changes its state. */
  async storeCollection(canisterId: string, state: State): Promise<void> {
    await userRegistry.store_icrc7_collection(
      canisterId,
      state === State.Active ? { Active: null } : { Inactive: null },
    )
    await storageWithTtl.remove(await this.getCacheName())
  }

  async removeCollection(canisterId: string): Promise<void> {
    await userRegistry.remove_icrc7_collection(canisterId)
    await storageWithTtl.remove(await this.getCacheName())
  }

  private async getCacheName(): Promise<string> {
    return `${ICRC7_REGISTRY_CACHE_NAME}${authState.getUserIdData().anchor}`
  }
}

const mapCollection = (c: ICRC7Collection): UserIcrc7Collection => ({
  canisterId: c.canister_id,
  state: "Active" in c.state ? State.Active : State.Inactive,
})

export const icrc7RegistryService = new Icrc7RegistryService()
