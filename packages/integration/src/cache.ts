import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"

import { localStorageTTL } from "./lib/util/local-strage-ttl"

export const integrationCache = new CacheContainer(new MemoryStorage())

export const resetIntegrationCache = (
  keys: string[],
  callback?: () => void,
) => {
  keys.map((key) => integrationCache.setItem(key, undefined, {}))
  callback && callback()
}

export const resetLocalStorageTTLCache = (
  keys: string[],
  callback?: () => void,
) => {
  keys.map((key) => localStorageTTL.setItem(key, undefined, 0))
  callback && callback()
}
