import { StorageMode } from "../enum/storage-mode"

/**
 * Holds the session's current storage persistence mode. The switch is one-way
 * (`DISK → MEMORY`) within a session; `reset()` restores the `DISK` default and
 * is used to isolate tests.
 */
export class StorageModeState {
  #mode: StorageMode = StorageMode.DISK

  get(): StorageMode {
    return this.#mode
  }

  set(mode: StorageMode): void {
    this.#mode = mode
  }

  reset(): void {
    this.#mode = StorageMode.DISK
  }
}

export const storageModeState = new StorageModeState()
