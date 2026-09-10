/**
 * @jest-environment jsdom
 */
import { StorageMode } from "./enum/storage-mode"
import { storageModeState } from "./state/storage-mode-state"

import { rememberMeLocalStorage } from "./remember-me-local-storage"

beforeEach(() => {
  storageModeState.reset()
  rememberMeLocalStorage.clear()
  window.localStorage.clear()
})

describe("rememberMeLocalStorage — DISK / MEMORY routing", () => {
  it("should read and write localStorage while in DISK mode", () => {
    // Given the default DISK mode
    // When a value is written through the facade
    rememberMeLocalStorage.setItem("anchor", "1")

    // Then it lands in raw localStorage and reads back through the facade
    expect(window.localStorage.getItem("anchor")).toBe("1")
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("1")
  })

  it("should read and write the in-memory backing while in MEMORY mode", () => {
    // Given the session has been switched to MEMORY
    storageModeState.set(StorageMode.MEMORY)

    // When a value is written through the facade
    rememberMeLocalStorage.setItem("anchor", "2")

    // Then it is readable through the facade but never touches localStorage
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("2")
    expect(window.localStorage.getItem("anchor")).toBeNull()
  })

  it("should clear both backings on removeItem", () => {
    // Given a key written on DISK and then again after flipping to MEMORY
    rememberMeLocalStorage.setItem("anchor", "disk-value")
    storageModeState.set(StorageMode.MEMORY)
    rememberMeLocalStorage.setItem("anchor", "memory-value")

    // When the key is removed
    rememberMeLocalStorage.removeItem("anchor")

    // Then neither backing still holds it
    expect(rememberMeLocalStorage.getItem("anchor")).toBeNull()
    storageModeState.reset()
    expect(window.localStorage.getItem("anchor")).toBeNull()
  })

  it("should empty the in-memory backing on clear()", () => {
    // Given a value in the MEMORY backing
    storageModeState.set(StorageMode.MEMORY)
    rememberMeLocalStorage.setItem("anchor", "3")

    // When the facade is cleared
    rememberMeLocalStorage.clear()

    // Then the key is gone
    expect(rememberMeLocalStorage.getItem("anchor")).toBeNull()
  })
})

describe("rememberMeLocalStorage — moveToMemory", () => {
  it("should relocate present localStorage keys into the in-memory backing while still in DISK mode", () => {
    // Given two identifying keys sitting in raw localStorage under DISK mode
    window.localStorage.setItem("anchor", "anchor-value")
    window.localStorage.setItem("eth-address", "eth-value")

    // When they are moved to memory (mode still DISK)
    rememberMeLocalStorage.moveToMemory(["anchor", "eth-address"])

    // Then they are gone from localStorage
    expect(window.localStorage.getItem("anchor")).toBeNull()
    expect(window.localStorage.getItem("eth-address")).toBeNull()

    // And readable from the in-memory backing once the mode flips to MEMORY
    storageModeState.set(StorageMode.MEMORY)
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("anchor-value")
    expect(rememberMeLocalStorage.getItem("eth-address")).toBe("eth-value")
  })

  it("should skip a missing key without throwing and still remove it from localStorage", () => {
    // Given only one of the requested keys is present
    window.localStorage.setItem("anchor", "anchor-value")

    // When a set including an absent key is moved
    expect(() =>
      rememberMeLocalStorage.moveToMemory(["anchor", "bitcoin-address"]),
    ).not.toThrow()

    // Then the present key is relocated and the absent one is a no-op
    expect(window.localStorage.getItem("anchor")).toBeNull()
    storageModeState.set(StorageMode.MEMORY)
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("anchor-value")
    expect(rememberMeLocalStorage.getItem("bitcoin-address")).toBeNull()
  })

  it("should not wipe the in-memory value it just stored (raw removeItem, not the facade)", () => {
    // Given a key in raw localStorage
    window.localStorage.setItem("anchor", "keep-me")

    // When it is moved to memory
    rememberMeLocalStorage.moveToMemory(["anchor"])

    // Then the in-memory backing still holds it — a facade removeItem would have
    // cleared both backings and lost it
    storageModeState.set(StorageMode.MEMORY)
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("keep-me")
  })
})
