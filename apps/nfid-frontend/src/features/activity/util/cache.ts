import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"

export const connectorCache = new CacheContainer(new MemoryStorage())

export const resetCachesByKey = (keys: string[], callback?: () => void) => {
  keys.map((key) => connectorCache.setItem(key, undefined, {}))
  callback && callback()
}
