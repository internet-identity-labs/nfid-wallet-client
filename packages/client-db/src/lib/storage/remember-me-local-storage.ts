import { StorageMode } from "./enum/storage-mode"
import { storageModeState } from "./state/storage-mode-state"

/**
 * String key/value facade over `localStorage` that follows the current storage
 * persistence mode:
 *
 * - `DISK`   → `window.localStorage`
 * - `MEMORY` → the in-process `#memory` map (lost on reload, by design)
 *
 * `removeItem` clears **both** backings so a key cannot linger after a mode
 * flip. Synchronous — its call sites (`getAddressFromCache`, the `anchor`
 * mismatch check) are synchronous.
 */
export class RememberMeLocalStorage {
  #memory = new Map<string, string>()

  getItem(key: string): string | null {
    if (storageModeState.get() === StorageMode.MEMORY) {
      return this.#memory.has(key) ? (this.#memory.get(key) as string) : null
    }
    return window.localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    if (storageModeState.get() === StorageMode.MEMORY) {
      this.#memory.set(key, value)
      return
    }
    window.localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    this.#memory.delete(key)
    window.localStorage.removeItem(key)
  }

  clear(): void {
    this.#memory.clear()
  }

  /**
   * Relocate `keys` from `window.localStorage` into `#memory`, then remove them
   * from `window.localStorage`. Writes `#memory` directly (independent of the
   * current mode) so `doNotRememberMe()` can call it before flipping to `MEMORY`.
   * Uses the raw `window.localStorage.removeItem`, not `this.removeItem`, which
   * would also wipe the value just stored in `#memory`.
   */
  moveToMemory(keys: string[]): void {
    for (const key of keys) {
      const value = window.localStorage.getItem(key)
      if (value != null) this.#memory.set(key, value)
      window.localStorage.removeItem(key)
    }
  }
}

export const rememberMeLocalStorage = new RememberMeLocalStorage()
