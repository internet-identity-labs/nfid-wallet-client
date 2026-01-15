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
        this.initializedDb.set("test", "test").then(() => {
          this.initializedDb!.get("test").then(() => {
            this.initializedDb!.remove("test").then(() => {
              resolve(this.initializedDb!)
            })
          })
        })
        return
      }
      IdbKeyVal.create({
        version: this.options.dbVersion || 1,
        dbName: this.options.dbName,
        storeName: this.options.storeName,
      })
        .then((db) => {
          this.initializedDb = db
          return this.initializedDb.set("test", "test")
        })
        .then(() => {
          return this.initializedDb!.get("test")
        })
        .then(() => {
          return this.initializedDb!.remove("test")
        })
        .then(() => {
          resolve(this.initializedDb!)
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

  public async removeAll(keys: string[]): Promise<void> {
    const db = await this._db
    await db.removeAll(keys)
  }

  public async getAllKeys(): Promise<string[]> {
    const db = await this._db
    return await db.getAllKeys()
  }

  public async getAll(): Promise<Array<{ key: string; value: T }>> {
    const db = await this._db
    return await db.getAll<T>()
  }

  public async clear(): Promise<void> {
    const db = await this._db
    await db.clear()
  }
}
