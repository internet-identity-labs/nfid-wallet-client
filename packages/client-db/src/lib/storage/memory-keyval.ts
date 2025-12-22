import { KeyValueStore } from "./types"

type IDBValidKey = string | number | Date | BufferSource | IDBValidKey[]

export class MemoryKeyVal implements KeyValueStore {
  constructor(private _map: Map<IDBValidKey, unknown>) {}

  public static create(): MemoryKeyVal {
    const map = new Map<string, IDBValidKey>()
    return new MemoryKeyVal(map)
  }

  /**
   * Basic setter
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @param value value to set
   * @returns void
   */
  public async set<T>(key: IDBValidKey, value: T): Promise<IDBValidKey> {
    console.debug("MemoryKeyVal.set", { key })
    this._map.set(key, value) as T
    return key
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
    console.debug("MemoryKeyVal.get", { key })
    return this._map.get(key) as T
  }

  /**
   * Remove a key
   * @param key {@link IDBValidKey}
   * @returns void
   */
  public async remove(key: IDBValidKey): Promise<void> {
    console.debug("MemoryKeyVal.remove", { key })
    this._map.delete(key)
  }

  /**
   * Clear storage
   * @returns void
   */
  public async clear(): Promise<void> {
    console.debug("MemoryKeyVal.clear")
    this._map.clear()
  }

  /**
   * Get all keys
   * @returns Promise<string[]>
   */
  public async getAllKeys(): Promise<string[]> {
    console.debug("MemoryKeyVal.getAllKeys")
    return Array.from(this._map.keys()).map((key) => key.toString())
  }

  /**
   * Get all entries (keys and values)
   * @returns Promise<Array<{ key: string; value: T }>>
   */
  public async getAll<T>(): Promise<Array<{ key: string; value: T }>> {
    console.debug("MemoryKeyVal.getAll")
    return Array.from(this._map.entries()).map(([key, value]) => ({
      key: key.toString(),
      value: value as T,
    }))
  }
}
