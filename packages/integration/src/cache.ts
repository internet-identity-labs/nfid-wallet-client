import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"

import { idbStorageTTL } from "./lib/util/idb-strage-ttl"

export const integrationCache = new CacheContainer(new MemoryStorage())

export const resetIntegrationCache = (
  keys: string[],
  callback?: () => void,
) => {
  keys.map((key) => integrationCache.setItem(key, undefined, {}))
  callback && callback()
}

export const resetIdbStorageTTLCache = async (
  keys: string[],
  callback?: () => void,
) => {
  await Promise.all(keys.map((key) => idbStorageTTL.removeItem(key)))
  callback && callback()
}
