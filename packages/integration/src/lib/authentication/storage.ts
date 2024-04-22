import { localStorageWithFallback } from "@nfid/client-db"

import { IdbKeyVal, KeyValueStore, MemoryKeyVal } from "./db"

export const KEY_STORAGE_KEY = "identity"
export const KEY_STORAGE_DELEGATION = "delegation"
export const KEY_VECTOR = "iv"
// Increment if any fields are modified
export const DB_VERSION = 1

export const isBrowser = typeof window !== "undefined"

export type StoredKey = string | CryptoKeyPair

/**
 * Interface for persisting user authentication data
 */
export interface AuthClientStorage {
  get(key: string): Promise<StoredKey | null>

  set(key: string, value: StoredKey): Promise<void>

  remove(key: string): Promise<void>
}

/**
 * Legacy implementation of AuthClientStorage, for use where IndexedDb is not available
 */
export class LocalStorage implements AuthClientStorage {
  constructor(
    public readonly prefix = "ic-",
    private readonly _localStorage?: Storage,
  ) {}

  public get(key: string): Promise<string | null> {
    return Promise.resolve(this._getLocalStorage().getItem(this.prefix + key))
  }

  public set(key: string, value: string): Promise<void> {
    this._getLocalStorage().setItem(this.prefix + key, value)
    return Promise.resolve()
  }

  public remove(key: string): Promise<void> {
    this._getLocalStorage().removeItem(this.prefix + key)
    return Promise.resolve()
  }

  private _getLocalStorage() {
    if (this._localStorage) {
      return this._localStorage
    }

    let ls
    try {
      ls =
        typeof window === "undefined"
          ? typeof global === "undefined"
            ? typeof self === "undefined"
              ? undefined
              : self.localStorage
            : global.localStorage
          : localStorageWithFallback
    } catch (error) {
      console.error("LocalStorage", { error })
    }

    if (!ls) {
      throw new Error("Could not find local storage.")
    }

    return ls
  }
}

/**
 * IdbStorage is an interface for simple storage of string key-value pairs built on {@link IdbKeyVal}
 *
 * It replaces {@link LocalStorage}
 * @see implements {@link AuthClientStorage}
 */
export class IdbStorage implements AuthClientStorage {
  // Initializes a KeyVal on first request
  private initializedDb: IdbKeyVal | undefined

  get _db(): Promise<KeyValueStore> {
    const db = new Promise<KeyValueStore>((resolve) => {
      if (this.initializedDb) {
        resolve(this.initializedDb)
        return
      }
      IdbKeyVal.create({ version: DB_VERSION })
        .then((db) => {
          this.initializedDb = db
          resolve(db)
        })
        .catch(() => {
          return resolve(MemoryKeyVal.create())
        })
    })
    return db
  }

  public async get(key: string): Promise<string | null> {
    const db = await this._db
    return await db.get<string>(key)
  }

  public async set(key: string, value: string): Promise<void> {
    const db = await this._db
    await db.set(key, value)
  }

  public async remove(key: string): Promise<void> {
    const db = await this._db
    await db.remove(key)
  }

  public async reset() {
    return Promise.all([
      this.remove(KEY_STORAGE_KEY),
      this.remove(KEY_STORAGE_DELEGATION),
    ])
  }
}

export const authStorage = new IdbStorage()
