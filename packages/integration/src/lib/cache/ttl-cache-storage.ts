import { IStorage, ICacheItem } from "node-ts-cache"
import { TtlStorage } from "@nfid/client-db"

export class TtlCacheStorage implements IStorage {
  constructor(private ttlStorage: TtlStorage<unknown>) {}

  async getItem(key: string): Promise<ICacheItem | undefined> {
    const item = await this.ttlStorage.get(key)
    return item ? (item as ICacheItem) : undefined
  }

  async setItem(key: string, content: ICacheItem): Promise<void> {
    await this.ttlStorage.set(key, content, content.meta.ttl)
  }

  async clear(): Promise<void> {
    await this.ttlStorage.clear()
  }
}
