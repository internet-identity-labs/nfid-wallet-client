import { StorageMode } from "../enum/storage-mode"

import { storageModeState } from "./storage-mode-state"

describe("storageModeState", () => {
  beforeEach(() => {
    storageModeState.reset()
  })

  it("should default to DISK", () => {
    // Given a freshly reset mode state
    // When the mode is read
    // Then it is DISK
    expect(storageModeState.get()).toBe(StorageMode.DISK)
  })

  it("should return the mode last set", () => {
    // Given MEMORY has been set
    storageModeState.set(StorageMode.MEMORY)

    // When the mode is read
    // Then it reports MEMORY
    expect(storageModeState.get()).toBe(StorageMode.MEMORY)
  })

  it("should restore the DISK default on reset", () => {
    // Given the mode has been moved to MEMORY
    storageModeState.set(StorageMode.MEMORY)

    // When it is reset
    storageModeState.reset()

    // Then it is DISK again
    expect(storageModeState.get()).toBe(StorageMode.DISK)
  })
})
