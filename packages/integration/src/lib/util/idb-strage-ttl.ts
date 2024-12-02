import { createStore, set, get, del, clear } from "idb-keyval"

const idb = createStore("nfid-wallet-store-with-ttl", "nfid-wallet-store")

class IdbStorageWithTTL {
  setItem(key: string, value: any, ttl: number): Promise<void> {
    const now = new Date().getTime()

    const item = {
      value: value,
      expiry: now + ttl * 3600000,
    }

    return set(key, JSON.stringify(item), idb)
  }

  async getItem(key: string): Promise<any | null> {
    const itemStr = await get(key, idb)

    if (!itemStr) {
      return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date().getTime()

    if (now > item.expiry) {
      await del(key, idb)
      return null
    }

    return item.value
  }

  async getEvenExpiredItem(
    key: string,
  ): Promise<{ object: any; expired: boolean } | null> {
    const itemStr = await get(key, idb)

    if (!itemStr) {
      return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date().getTime()

    if (now > item.expiry) {
      return { object: item.value, expired: true }
    }

    return { object: item.value, expired: false }
  }

  removeItem(key: string): Promise<void> {
    return del(key, idb)
  }

  clear(): Promise<void> {
    return clear(idb)
  }
}

export const idbStorageTTL = new IdbStorageWithTTL()
