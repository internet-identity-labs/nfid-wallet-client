import { StorageMode } from "./enum/storage-mode"
import { IdbKeyVal } from "./keyval/idb-keyval"
import { storageModeState } from "./state/storage-mode-state"
import { KeyValueStore } from "./types"

import { IdbStore } from "./idb-store"

const DB_NAME = "ttl-db"
const OBJECT_STORE_NAME = "ttl-store"

export class TtlStorage<T> extends IdbStore {
  get _db(): Promise<KeyValueStore> {
    const db = new Promise<KeyValueStore>((resolve) => {
      if (this.initializedStore) {
        this.initializedStore.set("test", "test")
        this.initializedStore.get("test")
        resolve(this.initializedStore)
        return
      }

      if (storageModeState.get() === StorageMode.MEMORY) {
        this.initializedStore = this.memoryStore()
        resolve(this.initializedStore)
        return
      }

      IdbKeyVal.create({
        version: this.options.dbVersion ?? 1,
        dbName: this.options.dbName,
        storeName: this.options.storeName,
      })
        .then((db) => {
          this.initializedStore = db
          this.initializedStore.set("test", "test")
          this.initializedStore.get("test")
          resolve(db)
        })
        .catch(() => {
          this.initializedStore = this.memoryStore()
          return resolve(this.initializedStore)
        })
    })
    return db
  }

  public async get(key: string): Promise<T | null> {
    const db = await this._db
    const item = await db.get<{ value: T; expiry: number }>(key)

    if (!item) return null

    if (Date.now() > item.expiry) {
      await db.remove(key)
      return null
    }

    return item.value
  }

  async getEvenExpired(
    key: string,
  ): Promise<{ value: T; expired: boolean } | null> {
    const db = await this._db
    const item = await db.get<{ value: T; expiry: number }>(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      return { value: item.value, expired: true }
    }

    return { value: item.value, expired: false }
  }

  public async set(key: string, value: T, ttlMillis: number): Promise<void> {
    const db = await this._db

    const valueToSave = {
      value,
      expiry: Date.now() + ttlMillis,
    }

    await db.set(key, valueToSave)
  }

  public async remove(key: string): Promise<void> {
    const db = await this._db
    await db.remove(key)
  }

  async clear(): Promise<void> {
    const db = await this._db
    return db.clear()
  }
}

export const storageWithTtl = new TtlStorage({
  dbName: DB_NAME,
  storeName: OBJECT_STORE_NAME,
})
