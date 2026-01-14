import { CacheContainer } from "node-ts-cache"
import { TtlCacheStorage } from "./ttl-cache-storage"
import { storageWithTtl } from "@nfid/client-db"

export const indexedDbCache = new CacheContainer(
  new TtlCacheStorage(storageWithTtl),
)
