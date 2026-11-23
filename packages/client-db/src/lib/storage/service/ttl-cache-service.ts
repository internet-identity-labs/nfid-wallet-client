import { TtlStorage, storageWithTtl } from "../ttl-storage"

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
  /**
   * "always": return any cached value (fresh or expired) at once and refresh
   * it in the background on every call. Concurrent refreshes of one key are
   * shared. Default: refresh only an expired value.
   */
  revalidate?: "always" | "expired"
  /**
   * Called with the new value after a background refresh has been stored,
   * only if it differs from the cached one (compared as JSON of the stored
   * form). Use it to re-render the UI (e.g. SWR `mutate`).
   */
  onRevalidated?: (value: T) => void
}

const sameJson = (a: unknown, b: unknown): boolean => {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

/**
 * Wraps TtlStorage with a stale-while-revalidate (SWR) strategy:
 * - No cache → fetch, store, return
 * - Cache expired → return stale value immediately, refresh in background
 * - Cache fresh → return cached value (or, with `revalidate: "always"`,
 *   return it and refresh in background)
 *
 * @param ttlMillis - fixed TTL in ms, or a factory function for dynamic TTL
 */
export class TtlCacheService {
  private readonly refreshing = new Map<string, Promise<unknown>>()

  constructor(private storage: TtlStorage<unknown>) {}

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMillis: number | (() => number),
    options?: TtlGetOrFetchOptions<T>,
  ): Promise<T> {
    const {
      forceRefetch,
      serialize,
      deserialize,
      onBackgroundError,
      revalidate = "expired",
      onRevalidated,
    } = options ?? {}

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

    if (cache.expired || revalidate === "always") {
      this.refreshInBackground(key, async () => {
        const value = await fetcher()
        await store(value)
        if (
          onRevalidated &&
          !sameJson(serialize ? serialize(value) : value, cache.value)
        ) {
          onRevalidated(value)
        }
      }).catch(
        onBackgroundError ??
          ((err) =>
            console.error("TtlCacheService: background refresh failed", err)),
      )
      return await fromCache(cache.value)
    }

    return await fromCache(cache.value)
  }

  /** One background refresh per key at a time; later callers share it. */
  private refreshInBackground(
    key: string,
    refresh: () => Promise<void>,
  ): Promise<void> {
    const running = this.refreshing.get(key)
    if (running) return running as Promise<void>
    const promise = refresh().finally(() => this.refreshing.delete(key))
    this.refreshing.set(key, promise)
    return promise
  }

  async invalidate(prefixes: string[]): Promise<void> {
    const db = await this.storage._db
    const keys = await db.getAllKeys()
    const matching = keys.filter((key: string) =>
      prefixes.some((prefix) => key.startsWith(prefix)),
    )
    await db.removeAll(matching)
  }

  async invalidateAll(): Promise<void> {
    await this.storage.clear()
  }
}

export const ttlCacheService = new TtlCacheService(storageWithTtl)
