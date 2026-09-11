import { StorageMode } from "./enum/storage-mode"
import { IdbKeyVal } from "./keyval/idb-keyval"
import { storageModeState } from "./state/storage-mode-state"
import { KeyValueStore } from "./types"

import { IdbStore } from "./idb-store"

export class Storage<T> extends IdbStore {
  get _db(): Promise<KeyValueStore> {
    const db = new Promise<KeyValueStore>((resolve) => {
      if (this.initializedStore) {
        this.initializedStore.set("test", "test").then(() => {
          this.initializedStore!.get("test").then(() => {
            this.initializedStore!.remove("test").then(() => {
              resolve(this.initializedStore!)
            })
          })
        })
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
          return this.initializedStore.set("test", "test")
        })
        .then(() => {
          return this.initializedStore!.get("test")
        })
        .then(() => {
          return this.initializedStore!.remove("test")
        })
        .then(() => {
          resolve(this.initializedStore!)
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
