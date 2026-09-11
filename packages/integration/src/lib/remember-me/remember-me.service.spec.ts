/**
 * @jest-environment jsdom
 */
import {
  IdbKeyVal,
  Storage,
  StorageMode,
  idbService,
  rememberMeLocalStorage,
  storageModeState,
} from "@nfid/client-db"
import { deleteDB } from "idb"

import { rememberMeService } from "./remember-me.service"

jest.mock("idb", () => {
  const actual = jest.requireActual<typeof import("idb")>("idb")
  return {
    ...actual,
    deleteDB: jest.fn((...args: Parameters<typeof actual.deleteDB>) =>
      actual.deleteDB(...args),
    ),
  }
})

const deleteDbMock = deleteDB as jest.MockedFunction<typeof deleteDB>

beforeEach(() => {
  global.indexedDB = new IDBFactory()
  window.localStorage.clear()
  storageModeState.reset()
  idbService.clear()
  rememberMeLocalStorage.clear()
  deleteDbMock.mockImplementation(realDeleteDb)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe("rememberMeService.isRemembered", () => {
  it("should not show the modal for a device that already has an anchor", () => {
    // Given an anchor in raw localStorage
    window.localStorage.setItem("anchor", "12345")

    // When isRemembered is read
    const result = rememberMeService.isRemembered()

    // Then it reports remembered
    expect(result).toBe(true)
  })

  it("should show the modal when no anchor is present", () => {
    // Given no anchor in localStorage
    window.localStorage.removeItem("anchor")

    // When isRemembered is read
    const result = rememberMeService.isRemembered()

    // Then it reports not-remembered
    expect(result).toBe(false)
  })

  it("should report not-remembered when localStorage access throws", () => {
    // Given localStorage.getItem throws
    jest.spyOn(window.Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable")
    })

    // When isRemembered is read
    const result = rememberMeService.isRemembered()

    // Then it swallows the error and reports not-remembered
    expect(result).toBe(false)
  })
})

describe("rememberMeService.doNotRememberMe — full DISK → MEMORY flow", () => {
  it("should migrate every store to memory, drop the raw keys and end in MEMORY mode on the happy path", async () => {
    // Given DISK mode, seeded registered stores and the three raw keys present
    const seeded = [
      new Storage<string>({ dbName: "flow-a-db", storeName: "a-store" }),
      new Storage<string>({ dbName: "flow-b-db", storeName: "b-store" }),
    ]
    await Promise.all(
      seeded.map((store, index) => store.set("row", `value-${index}`)),
    )
    window.localStorage.setItem("anchor", "anchor-value")
    window.localStorage.setItem("eth-address", "0xabc")
    window.localStorage.setItem("bitcoin-address", "bc1xyz")

    // When the device opts out
    await rememberMeService.doNotRememberMe()

    // Then the session is fully MEMORY, raw keys are off localStorage but readable
    // through the facade, and the seeded rows survive an IndexedDB wipe
    expect(storageModeState.get()).toBe(StorageMode.MEMORY)
    expect(window.localStorage.getItem("anchor")).toBeNull()
    expect(window.localStorage.getItem("eth-address")).toBeNull()
    expect(window.localStorage.getItem("bitcoin-address")).toBeNull()
    expect(rememberMeLocalStorage.getItem("anchor")).toBe("anchor-value")
    expect(rememberMeLocalStorage.getItem("eth-address")).toBe("0xabc")

    global.indexedDB = new IDBFactory()
    expect(await seeded[0].get("row")).toBe("value-0")
    expect(await seeded[1].get("row")).toBe("value-1")
  })

  it("should be an idempotent no-op when already in MEMORY mode", async () => {
    // Given a first opt-out has already resolved
    await rememberMeService.doNotRememberMe()
    expect(storageModeState.get()).toBe(StorageMode.MEMORY)
    const deleteSpy = jest.spyOn(global.indexedDB, "deleteDatabase")

    // When it is called again
    await rememberMeService.doNotRememberMe()

    // Then it stays MEMORY and never touches IndexedDB the second time
    expect(storageModeState.get()).toBe(StorageMode.MEMORY)
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it("should leave the device fully remembered when the store copy fails", async () => {
    // Given DISK mode, a seeded store and a rejecting copy phase
    const seeded = new Storage<string>({
      dbName: "copy-fail-db",
      storeName: "copy-fail-store",
    })
    await seeded.set("row", "on-disk")
    window.localStorage.setItem("anchor", "anchor-value")
    window.localStorage.setItem("eth-address", "0xabc")
    window.localStorage.setItem("bitcoin-address", "bc1xyz")
    jest
      .spyOn(IdbKeyVal.prototype, "getAll")
      .mockRejectedValueOnce(new Error("copy failed"))

    // When the device tries to opt out
    await expect(rememberMeService.doNotRememberMe()).rejects.toThrow(
      "Unable to switch to in-memory storage",
    )

    // Then nothing changed — still DISK, raw keys intact, store still on disk
    expect(storageModeState.get()).toBe(StorageMode.DISK)
    expect(window.localStorage.getItem("anchor")).toBe("anchor-value")
    expect(window.localStorage.getItem("eth-address")).toBe("0xabc")
    expect(window.localStorage.getItem("bitcoin-address")).toBe("bc1xyz")
    expect(await seeded.get("row")).toBe("on-disk")
  })

  it("should roll back to DISK when the database delete fails after a successful copy", async () => {
    // Given DISK mode, a seeded store, and every deleteDatabase request failing
    const seeded = new Storage<string>({
      dbName: "delete-fail-db",
      storeName: "delete-fail-store",
    })
    await seeded.set("row", "on-disk")
    window.localStorage.setItem("anchor", "anchor-value")
    window.localStorage.setItem("eth-address", "0xabc")
    window.localStorage.setItem("bitcoin-address", "bc1xyz")
    failEveryDelete()

    // When the device tries to opt out
    await expect(rememberMeService.doNotRememberMe()).rejects.toThrow(
      "Unable to clear on-disk storage",
    )

    // Then it rolled back — DISK, raw keys intact, and a read re-opens IndexedDB
    expect(storageModeState.get()).toBe(StorageMode.DISK)
    expect(window.localStorage.getItem("anchor")).toBe("anchor-value")
    expect(window.localStorage.getItem("bitcoin-address")).toBe("bc1xyz")
    expect(await seeded.get("row")).toBe("on-disk")
  })

  it("should not support an in-session retry after a delete failure", async () => {
    // Given a first opt-out already failed and rolled back to DISK
    const seeded = new Storage<string>({
      dbName: "no-retry-db",
      storeName: "no-retry-store",
    })
    await seeded.set("row", "on-disk")
    window.localStorage.setItem("anchor", "anchor-value")
    failEveryDelete()
    await expect(rememberMeService.doNotRememberMe()).rejects.toThrow(
      "Unable to clear on-disk storage",
    )

    // When it is retried in the same session with the delete still failing
    await expect(rememberMeService.doNotRememberMe()).rejects.toThrow(
      "Unable to clear on-disk storage",
    )

    // Then the session is still DISK — recovery is sign-out + sign-in, not retry
    expect(storageModeState.get()).toBe(StorageMode.DISK)
  })
})

function realDeleteDb(
  ...args: Parameters<typeof deleteDB>
): ReturnType<typeof deleteDB> {
  return jest.requireActual<typeof import("idb")>("idb").deleteDB(...args)
}

function failEveryDelete(): void {
  deleteDbMock.mockRejectedValue(new Error("delete blocked past timeout"))
}
