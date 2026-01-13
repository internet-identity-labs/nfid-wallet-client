import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"

export const integrationCache = new CacheContainer(new MemoryStorage())

export const resetIntegrationCache = (
  keys: string[],
  callback?: () => void,
) => {
  void Promise.all(
    keys.map((key) => integrationCache.setItem(key, undefined, {})),
  )
  callback?.()
}
