import { deleteDB } from "idb"

import type { IdbStore } from "../idb-store"

interface RegisteredStore {
  dbName: string
  storeName: string
  store: IdbStore
}

/**
 * Registry of every `Storage` / `TtlStorage` singleton, plus the on-disk wipe.
 *
 * Each store self-registers from its constructor; the service drives the
 * genuinely all-or-nothing `DISK → MEMORY` migration and `deleteAll()`. Each
 * store owns its own in-memory backing — the service holds no memory map of its
 * own.
 *
 * `deleteAll()`: the registered databases (`getDbNames()`) are the atomic set —
 * if any one cannot be deleted this rejects.
 */
export class IdbService {
  readonly #deleteTimeoutMs = 3000
  #registry = new Map<string, RegisteredStore>()

  /**
   * Called by every `IdbStore` constructor. First write wins so duplicate
   * `{ dbName, storeName }` singletons register once.
   */
  register(dbName: string, storeName: string, store: IdbStore): void {
    const registryKey = `${dbName}:${storeName}`
    if (this.#registry.has(registryKey)) return
    this.#registry.set(registryKey, { dbName, storeName, store })
  }

  /** Distinct IndexedDB database names across every registered store. */
  getDbNames(): string[] {
    const names = new Set<string>()
    for (const entry of this.#registry.values()) names.add(entry.dbName)
    return Array.from(names)
  }

  /**
   * Move every registered store from IndexedDB to its cached `MemoryKeyVal`,
   * genuinely all-or-nothing:
   *
   * 1. Copy phase — every store copies its rows into memory. Nothing is closed,
   *    nothing is rebound. A throw here rejects with every store still on `DISK`
   *    and the populated memory caches inert (mode is still `DISK`).
   * 2. Commit phase — only reached when every copy succeeded. Each store closes
   *    its IndexedDB handle and rebinds to its `MemoryKeyVal`. Synchronous, never
   *    throws.
   */
  async migrateAllToMemory(): Promise<void> {
    for (const entry of this.#registry.values()) {
      await entry.store.copyToMemory()
    }
    for (const entry of this.#registry.values()) {
      entry.store.commitToMemory()
    }
  }

  /**
   * Undo the commit phase: drop every store's bound instance so the next access
   * re-opens a fresh `IdbKeyVal` under `DISK`. Used by `doNotRememberMe()` to
   * roll back when the subsequent `deleteAll()` rejects. One direction only — the
   * on-disk data was never deleted at this point.
   */
  rebindAllToDisk(): void {
    for (const entry of this.#registry.values()) {
      entry.store.rebindToDisk()
    }
  }

  /** Reset every registered store's in-memory backing, then drop every registration. */
  clear(): void {
    this.clearMemory()
    this.#registry.clear()
  }

  /**
   * Reset each registered store's in-memory backing, keeping the registrations.
   * Used by `auth-state.spec.ts`, which relies on the stores registered at
   * module load.
   */
  clearMemory(): void {
    for (const entry of this.#registry.values()) {
      entry.store.clearMemory()
    }
  }

  /**
   * Delete every registered IndexedDB database (`getDbNames()`), each raced
   * against a ~3s timeout; rejects if any delete fails.
   */
  async deleteAll(): Promise<void> {
    const registeredNames = this.getDbNames()
    await Promise.all(registeredNames.map((name) => this.#deleteSingleDb(name)))
  }

  #deleteSingleDb(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(`Timed out deleting IndexedDB database "${name}"`))
      }, this.#deleteTimeoutMs)

      deleteDB(name, {
        blocked() {
          console.warn(`delete of "${name}" is blocked by an open connection`)
        },
      })
        .then(() => {
          clearTimeout(timeoutHandle)
          resolve()
        })
        .catch((error) => {
          clearTimeout(timeoutHandle)
          reject(error instanceof Error ? error : new Error(String(error)))
        })
    })
  }
}

export const idbService = new IdbService()
