import { TtlStorage, storageWithTtl } from "./ttl-storage"

export interface TtlGetOrFetchOptions<T> {
  /**
   * If true, bypass cache and always fetch fresh data.
   * Result will be stored back in cache.
   */
  forceRefetch?: boolean
  /**
   * Serialize T before storing in cache.
   * Use when T contains non-serializable values (BigInt, class instances, etc.)
   */
  serialize?: (value: T) => unknown
  /**
   * Deserialize stored value back to T when reading from cache.
   * Supports async deserialization.
   * Required if `serialize` is provided.
   */
  deserialize?: (stored: unknown) => T | Promise<T>
  /**
   * Called when background cache refresh fails.
   * Defaults to console.error.
   */
  onBackgroundError?: (error: unknown) => void
}

/**
 * Wraps TtlStorage with a stale-while-revalidate (SWR) strategy:
 * - No cache → fetch, store, return
 * - Cache expired → return stale value immediately, refresh in background
 * - Cache fresh → return cached value
 *
 * @param ttlMillis - fixed TTL in ms, or a factory function for dynamic TTL
 */
export class TtlCacheService {
  constructor(private storage: TtlStorage<unknown>) {}

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMillis: number | (() => number),
    options?: TtlGetOrFetchOptions<T>,
  ): Promise<T> {
    const { forceRefetch, serialize, deserialize, onBackgroundError } =
      options ?? {}

    const store = async (value: T): Promise<void> => {
      const toStore = serialize ? serialize(value) : value
      const ttl = typeof ttlMillis === "function" ? ttlMillis() : ttlMillis
      await this.storage.set(key, toStore, ttl)
    }

    const fromCache = (stored: unknown): Promise<T> =>
      Promise.resolve(deserialize ? deserialize(stored) : (stored as T))

    if (forceRefetch) {
      const value = await fetcher()
      await store(value)
      return value
    }

    const cache = await this.storage.getEvenExpired(key)

    if (!cache) {
      const value = await fetcher()
      await store(value)
      return value
    }

    if (cache.expired) {
      fetcher()
        .then(store)
        .catch(
          onBackgroundError ??
            ((err) =>
              console.error("TtlCacheService: background refresh failed", err)),
        )
      return await fromCache(cache.value)
    }

    return await fromCache(cache.value)
  }

  async invalidate(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.storage.remove(key)))
  }
}

export const ttlCacheService = new TtlCacheService(storageWithTtl)
