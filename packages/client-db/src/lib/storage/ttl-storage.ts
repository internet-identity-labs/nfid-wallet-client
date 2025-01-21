import { IdbKeyVal } from "./idb-keyval"
import { MemoryKeyVal } from "./memory-keyval"
import { KeyValueStore } from "./types"

const DB_NAME = "ttl-db"
const OBJECT_STORE_NAME = "ttl-store"

export class TtlStorage<T> {
  // Initializes a KeyVal on first request
  private initializedDb: IdbKeyVal | undefined

  constructor(
    private options: {
      dbName: string
      storeName: string
      dbVersion?: number
    },
  ) {}

  get _db(): Promise<KeyValueStore> {
    const db = new Promise<KeyValueStore>((resolve) => {
      if (this.initializedDb) {
        this.initializedDb.set("test", "test")
        this.initializedDb.get("test")
        resolve(this.initializedDb)
        return
      }
      IdbKeyVal.create({
        version: this.options.dbVersion || 1,
        dbName: this.options.dbName,
        storeName: this.options.storeName,
      })
        .then((db) => {
          this.initializedDb = db
          this.initializedDb.set("test", "test")
          this.initializedDb.get("test")
          resolve(db)
        })
        .catch(() => {
          return resolve(MemoryKeyVal.create())
        })
    })
    return db
  }

  public async get(key: string): Promise<T | null> {
    const db = await this._db
    const item = await db.get<{ value: T; expiry: number }>(key)

    if (!item) return null

    if (Date.now() > item.expiry) {
      db.remove(key)
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
