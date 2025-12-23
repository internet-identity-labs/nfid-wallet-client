import { Storage } from "@nfid/client-db"
import { UserAddressId } from "../types"
import { UserAddressEntity } from "../interfaces"

type CacheState =
  | { loaded: false }
  | { loaded: true; cache: Map<UserAddressId, UserAddressEntity> }

export class AddressBookCache {
  private state: CacheState = { loaded: false }

  constructor(private storage: Storage<UserAddressEntity>) {}

  async getCache(): Promise<Map<UserAddressId, UserAddressEntity>> {
    if (!this.state.loaded) {
      await this._loadFromIndexedDB()
    }

    if (!this.state.loaded) {
      throw new Error("Failed to load address book cache")
    }

    return this.state.cache
  }

  async reload(): Promise<void> {
    await this._loadFromIndexedDB()
  }

  reset(): void {
    this.state = { loaded: false }
  }

  private async _loadFromIndexedDB(): Promise<void> {
    const entries = await this.storage.getAll()
    const addresses = new Map(entries.map(({ key, value }) => [key, value]))
    this.state = { loaded: true, cache: addresses }
  }
}
