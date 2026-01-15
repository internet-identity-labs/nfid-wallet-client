import { openDB, IDBPDatabase } from "idb"

import { KeyValueStore } from "./types"

type Database = IDBPDatabase<unknown>
type DBCreateOptions = {
  dbName: string
  storeName: string
  version?: number
}

const _openDbStore = async (
  dbName: string,
  storeName: string,
  version: number,
) => {
  console.debug("_openDbStore", { dbName, storeName, version })
  return await openDB(dbName, version, {
    upgrade: (database) => {
      database.objectStoreNames
      if (database.objectStoreNames.contains(storeName)) {
        database.clear(storeName)
      }
      database.createObjectStore(storeName)
    },
  })
}

async function _getValue<T>(
  db: Database,
  storeName: string,
  key: IDBValidKey,
): Promise<T | undefined> {
  return await db.get(storeName, key)
}

async function _setValue<T>(
  db: Database,
  storeName: string,
  key: IDBValidKey,
  value: T,
): Promise<IDBValidKey> {
  return await db.put(storeName, value, key)
}

async function _removeValue(
  db: Database,
  storeName: string,
  key: IDBValidKey,
): Promise<void> {
  return await db.delete(storeName, key)
}

async function _clear(db: Database, storeName: string): Promise<void> {
  return await db.clear(storeName)
}

/**
 * Simple Key Value store
 */
export class IdbKeyVal implements KeyValueStore {
  /**
   *
   * @param {DBCreateOptions} options {@link DbCreateOptions}
   * @param {DBCreateOptions['dbName']} options.dbName name for the indexeddb database
   * @default 'auth-client-db'
   * @param {DBCreateOptions['storeName']} options.storeName name for the indexeddb Data Store
   * @default 'ic-keyval'
   * @param {DBCreateOptions['version']} options.version version of the database. Increment to safely upgrade
   * @constructs an {@link IdbKeyVal}
   */
  public static async create(options: DBCreateOptions): Promise<IdbKeyVal> {
    console.debug("IdbKeyVal.create", { options })
    const { dbName, storeName, version = 1 } = options ?? {}
    const db = await _openDbStore(dbName, storeName, version)
    return new IdbKeyVal(db, storeName)
  }

  // Do not use - instead prefer create
  private constructor(
    private _db: Database,
    private _storeName: string,
  ) {}

  /**
   * Basic setter
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @param value value to set
   * @returns void
   */
  public async set<T>(key: IDBValidKey, value: T) {
    return await _setValue<T>(this._db, this._storeName, key, value)
  }
  /**
   * Basic getter
   * Pass in a type T for type safety if you know the type the value will have if it is found
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @returns `Promise<T | null>`
   * @example
   * await get<string>('exampleKey') -> 'exampleValue'
   */
  public async get<T>(key: IDBValidKey): Promise<T | null> {
    return (await _getValue<T>(this._db, this._storeName, key)) ?? null
  }

  /**
   * Remove a key
   * @param key {@link IDBValidKey}
   * @returns void
   */
  public async remove(key: IDBValidKey) {
    return await _removeValue(this._db, this._storeName, key)
  }

  /**
   * Remove multiple keys in a single transaction
   * @param keys array of {@link IDBValidKey}
   * @returns void
   */
  public async removeAll(keys: IDBValidKey[]): Promise<void> {
    if (keys.length === 0) return
    const tx = this._db.transaction(this._storeName, "readwrite")
    const store = tx.objectStore(this._storeName)
    await Promise.all(keys.map((key) => store.delete(key)))
    await tx.done
  }

  /**
   * Clear db
   * @returns void
   */
  public async clear() {
    return await _clear(this._db, this._storeName)
  }

  public async getAllKeys(): Promise<string[]> {
    const tx = this._db.transaction(this._storeName, "readonly")
    const store = tx.objectStore(this._storeName)
    const keys: string[] = []
    let cursor = await store.openCursor()

    while (cursor) {
      keys.push(cursor.key as string)
      cursor = await cursor.continue()
    }

    return keys
  }

  public async getAll<T>(): Promise<Array<{ key: string; value: T }>> {
    const tx = this._db.transaction(this._storeName, "readonly")
    const store = tx.objectStore(this._storeName)
    const results: Array<{ key: string; value: T }> = []
    let cursor = await store.openCursor()

    while (cursor) {
      results.push({ key: cursor.key as string, value: cursor.value as T })
      cursor = await cursor.continue()
    }

    return results
  }
}
