import { CacheContainer, ICacheItem } from "node-ts-cache"
import { CompositeTtlCacheStorage } from "./composite-ttl-cache-storage"
import { Storage } from "@nfid/client-db"

export interface IcExplorerResponse {
  statusCode: number
  message: string | null
  data: IcExplorerData
}

export interface IcExplorerData {
  tokenList: IcExplorerTokenItem[] | null
  addressList: IcExplorerAddressItem[] | null
}

export interface IcExplorerTokenItem {
  ledgerId: string | null
  priceUSD: string | null
  symbol: string | null
  type: string | null
}

export interface IcExplorerAddressItem {
  type: string
  symbol: string | null
  ledgerId: string | null
  priceUSD: number | null
  alias: string | null
  principalId: string | null
  accountId: string | null
  subaccountId: string | null
}

export interface IcExplorerAddressItemCacheItem extends ICacheItem {
  content: IcExplorerResponse
}

export const icExplorerTtlStorage = new Storage<IcExplorerAddressItemCacheItem>(
  {
    dbName: "ic-explorer-db",
    storeName: "ic-explorer-ttl-storage",
  },
)

export const icExplorerAddressItemCacheIdb = new CacheContainer(
  new CompositeTtlCacheStorage<IcExplorerAddressItemCacheItem>(
    icExplorerTtlStorage,
  ),
)
