export interface KeyValueStore {
  get<T>(key: IDBValidKey): Promise<T | null>
  set<T>(key: IDBValidKey, value: T): Promise<IDBValidKey>
  remove(key: IDBValidKey): Promise<void>
  clear(): Promise<void>
  getAllKeys(): Promise<string[]>
}
