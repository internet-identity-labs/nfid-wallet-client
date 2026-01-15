import { IStorage, ICacheItem } from "node-ts-cache"
import { Storage } from "@nfid/client-db"

export class CompositeTtlCacheStorage<
  T extends ICacheItem,
> implements IStorage {
  private memoryCache = new Map<string, T>()
  private operationQueue = Promise.resolve()
  private isInitialized = false

  constructor(private storage: Storage<T>) {}

  async getItem(key: string): Promise<T | undefined> {
    return this.enqueueOperation(async () => {
      if (!this.isInitialized) {
        await this.loadFromStorage()
        this.isInitialized = true
      }
      return this.memoryCache.get(key)
    })
  }

  async setItem(key: string, item: T | undefined): Promise<void> {
    return this.enqueueOperation(async () => {
      if (item === undefined) {
        this.memoryCache.delete(key)
        await this.storage.remove(key)
        return
      }
      await this.storage.set(key, item)
      this.memoryCache.set(key, item)
      this.isInitialized = true
    })
  }

  async clear(): Promise<void> {
    return this.enqueueOperation(async () => {
      await this.storage.clear()
      this.memoryCache.clear()
      this.isInitialized = false
    })
  }

  private async loadFromStorage(): Promise<void> {
    const items = await this.storage.getAll()
    const { expiredKeys, validItems } = this.partitionItems(items)

    if (expiredKeys.length > 0) {
      await this.storage.removeAll(expiredKeys)
    }

    this.memoryCache = new Map(validItems)
  }

  private partitionItems(items: Array<{ key: string; value: T }>): {
    expiredKeys: string[]
    validItems: Array<[string, T]>
  } {
    return items.reduce(
      (acc, item) => {
        if (this.isItemExpired(item.value)) {
          acc.expiredKeys.push(item.key)
        } else {
          acc.validItems.push([item.key, item.value])
        }
        return acc
      },
      { expiredKeys: [] as string[], validItems: [] as Array<[string, T]> },
    )
  }

  private isItemExpired(item: ICacheItem): boolean {
    return Date.now() > item.meta.createdAt + item.meta.ttl
  }

  private async enqueueOperation<R>(operation: () => Promise<R>): Promise<R> {
    const currentOperation = this.operationQueue.then(
      () => operation(),
      () => operation(), // Run even if previous operation failed
    )

    this.operationQueue = currentOperation.then(
      () => {},
      () => {}, // Error: still resolve with void (allows queue to continue)
    )

    return currentOperation
  }
}
