import { IdbKeyVal } from "./idb-keyval"
import { MemoryKeyVal } from "./memory-keyval"
import { KeyValueStore } from "./types"

export class Storage<T> {
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
    return await db.get<T>(key)
  }

  public async set(key: string, value: T): Promise<void> {
    const db = await this._db
    await db.set(key, value)
  }

  public async remove(key: string): Promise<void> {
    const db = await this._db
    await db.remove(key)
  }

  public async getAllKeys(): Promise<string[]> {
    const db = await this._db
    return await db.getAllKeys()
  }

  public async clear(): Promise<void> {
    const db = await this._db
    await db.clear()
  }
}
