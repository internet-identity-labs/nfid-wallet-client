import { IdbKeyVal } from "./keyval/idb-keyval"
import { MemoryKeyVal } from "./keyval/memory-keyval"
import { idbService } from "./service/idb-service"
import { KeyValueStore } from "./types"

export interface IdbStoreOptions {
  dbName: string
  storeName: string
  dbVersion?: number
}

/**
 * Shared base for `Storage` and `TtlStorage`. Self-registers with
 * `idbService` on construction and can be migrated from IndexedDB to an
 * in-memory backing.
 *
 * `copyToMemory` is the only failable / async member — it copies every row and
 * touches nothing else, so a throw leaves the store fully bound to `DISK`.
 * `commitToMemory` and `rebindToDisk` are synchronous and must never throw.
 */
export abstract class IdbStore {
  // Initializes a KeyVal on first request
  protected initializedStore: KeyValueStore | undefined

  // This store's own in-memory backing. Created up front, reused for the life of
  // the singleton so a store rebound to `MEMORY` and read back sees its data.
  #memory: MemoryKeyVal = MemoryKeyVal.create()

  constructor(protected options: IdbStoreOptions) {
    idbService.register(options.dbName, options.storeName, this)
  }

  protected get storeKey(): string {
    return `${this.options.dbName}:${this.options.storeName}`
  }

  /** This store's own in-memory backing. */
  protected memoryStore(): MemoryKeyVal {
    return this.#memory
  }

  /**
   * Drop the in-memory backing (fresh empty map). If the store is currently
   * bound to it, unbind so the next access re-resolves. For test isolation.
   */
  public clearMemory(): void {
    if (this.initializedStore === this.#memory) {
      this.initializedStore = undefined
    }
    this.#memory = MemoryKeyVal.create()
  }

  /**
   * Copy every row from IndexedDB into this store's cached `MemoryKeyVal`.
   * Opens and closes its own `IdbKeyVal` handle and touches neither
   * `initializedStore` nor the live connection, so a throw leaves the store
   * fully bound to `DISK`.
   */
  public async copyToMemory(): Promise<void> {
    const memoryStore = this.memoryStore()
    if (this.initializedStore === memoryStore) return

    const idbHandle = await IdbKeyVal.create({
      version: this.options.dbVersion ?? 1,
      dbName: this.options.dbName,
      storeName: this.options.storeName,
    })
    try {
      const entries = await idbHandle.getAll()
      for (const { key: entryKey, value } of entries) {
        await memoryStore.set(entryKey, value)
      }
    } finally {
      try {
        idbHandle.close()
      } catch (error) {
        console.warn("closing migration handle failed", error)
      }
    }
  }

  /**
   * Rebind this store to its cached `MemoryKeyVal`, closing the previous
   * on-disk handle. Synchronous, never throws.
   */
  public commitToMemory(): void {
    const memoryStore = this.memoryStore()
    if (this.initializedStore && this.initializedStore !== memoryStore) {
      try {
        this.initializedStore.close?.()
      } catch (error) {
        console.warn("closing previous store handle failed", error)
      }
    }
    this.initializedStore = memoryStore
  }

  /**
   * Drop the bound instance so the next `_db` access re-opens a fresh
   * `IdbKeyVal` under `DISK`. Used to roll a commit back; the on-disk data was
   * never deleted at that point.
   */
  public rebindToDisk(): void {
    this.initializedStore = undefined
  }
}
