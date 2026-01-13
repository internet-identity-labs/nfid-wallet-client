import { UserAddressEntity } from "../interfaces"
import { UserAddressId } from "../types"

type CacheState =
  | { loaded: false }
  | { loaded: true; cache: Map<UserAddressId, UserAddressEntity> }

export class AddressBookCache {
  private state: CacheState = { loaded: false }

  getCache(): Map<UserAddressId, UserAddressEntity> {
    if (!this.state.loaded) {
      throw new Error("Cache not loaded.")
    }

    return this.state.cache
  }

  reset(): void {
    this.state = { loaded: false }
  }

  isLoaded(): boolean {
    return this.state.loaded
  }

  updateFromBackend(entities: Array<UserAddressEntity>): void {
    const addresses = new Map(entities.map((entity) => [entity.id, entity]))
    this.state = { loaded: true, cache: addresses }
  }
}
