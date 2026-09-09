import { deleteDB, openDB } from "idb"

import { StorageMode } from "../enum/storage-mode"
import { IdbKeyVal } from "../keyval/idb-keyval"
import { storageModeState } from "../state/storage-mode-state"
import { Storage } from "../storage"

import { idbService } from "./idb-service"

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
  storageModeState.reset()
  idbService.clear()
  deleteDbMock.mockImplementation(realDeleteDb)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe("idbService", () => {
  it("should reset every registered store's in-memory backing on clearMemory()", async () => {
    // Given two registered stores in MEMORY mode each holding a row
    storageModeState.set(StorageMode.MEMORY)
    const stores = ["one", "two"].map(
      (name) =>
        new Storage<string>({
          dbName: `mem-${name}-db`,
          storeName: `${name}-store`,
        }),
    )
    await Promise.all(
      stores.map((store, index) => store.set("key", `row-${index}`)),
    )
    expect(await stores[0].get("key")).toBe("row-0")

    // When the service clears the memory backings
    idbService.clearMemory()

    // Then each store serves a fresh empty backing (memory miss → undefined)
    expect(await stores[0].get("key")).toBeUndefined()
    expect(await stores[1].get("key")).toBeUndefined()
  })

  it("should register each Storage exactly once, deduped by dbName:storeName", () => {
    // Given two Storage instances sharing one { dbName, storeName }
    new Storage<string>({ dbName: "dupe-db", storeName: "dupe-store" })
    new Storage<string>({ dbName: "dupe-db", storeName: "dupe-store" })

    // When the registered database names are read
    const names = idbService.getDbNames()

    // Then the shared name is present exactly once
    expect(names.filter((name) => name === "dupe-db")).toHaveLength(1)
  })

  it("should list every distinct registered database name", () => {
    // Given three stores across two databases
    new Storage<string>({ dbName: "one-db", storeName: "a" })
    new Storage<string>({ dbName: "one-db", storeName: "b" })
    new Storage<string>({ dbName: "two-db", storeName: "c" })

    // When the names are read
    const names = idbService.getDbNames()

    // Then both databases appear once each
    expect(names.filter((name) => name === "one-db")).toHaveLength(1)
    expect(names.filter((name) => name === "two-db")).toHaveLength(1)
  })

  it("should copy IndexedDB contents into memory and rebind only after every store copied", async () => {
    // Given three registered stores each seeded with a row on DISK
    const stores = ["alpha", "beta", "gamma"].map(
      (name) =>
        new Storage<string>({
          dbName: `copy-${name}-db`,
          storeName: `${name}-store`,
        }),
    )
    await Promise.all(
      stores.map((store, index) => store.set("key", `row-${index}`)),
    )
    const closeSpy = jest.spyOn(IdbKeyVal.prototype, "close")

    // When every store is migrated to memory
    await idbService.migrateAllToMemory()

    // Then each store serves its seeded row from memory after IndexedDB is wiped
    global.indexedDB = new IDBFactory()
    expect(await stores[0].get("key")).toBe("row-0")
    expect(await stores[1].get("key")).toBe("row-1")
    expect(await stores[2].get("key")).toBe("row-2")
    expect(closeSpy).toHaveBeenCalled()
  })

  it("should rebind nothing when one store copy throws", async () => {
    // Given three seeded stores and a getAll that rejects once during the copy phase
    const stores = ["one", "two", "three"].map(
      (name) =>
        new Storage<string>({
          dbName: `throw-${name}-db`,
          storeName: `${name}-store`,
        }),
    )
    await Promise.all(
      stores.map((store, index) => store.set("key", `value-${index}`)),
    )
    jest
      .spyOn(IdbKeyVal.prototype, "getAll")
      .mockRejectedValueOnce(new Error("copy failed"))

    // When migration runs
    await expect(idbService.migrateAllToMemory()).rejects.toThrow("copy failed")

    // Then every seeded store is still bound to DISK — a read still hits IndexedDB
    expect(storageModeState.get()).toBe(StorageMode.DISK)
    expect(await stores[0].get("key")).toBe("value-0")
    expect(await stores[1].get("key")).toBe("value-1")
    expect(await stores[2].get("key")).toBe("value-2")
  })

  it("should re-open IndexedDB under DISK for every store on rebindAllToDisk", async () => {
    // Given a seeded store that has been migrated and committed to memory
    const store = new Storage<string>({
      dbName: "rebind-db",
      storeName: "rebind-store",
    })
    await store.set("key", "on-disk")
    await idbService.migrateAllToMemory()

    // When the commit is rolled back
    idbService.rebindAllToDisk()

    // Then the next read re-opens the untouched on-disk database
    expect(await store.get("key")).toBe("on-disk")
  })
})

describe("idbService.deleteAll", () => {
  it("should reject when a registered database cannot be deleted", async () => {
    // Given a registered store and every deleteDB call rejecting
    new Storage<string>({
      dbName: "delete-fail-db",
      storeName: "delete-fail-store",
    })
    deleteDbMock.mockRejectedValue(new Error("delete blocked past timeout"))

    // When / Then deleteAll rejects
    await expect(idbService.deleteAll()).rejects.toThrow(
      "delete blocked past timeout",
    )
  })

  it("should leave an unregistered on-disk database untouched", async () => {
    // Given one registered store and one unrelated database that nobody registered
    new Storage<string>({
      dbName: "registered-db",
      storeName: "registered-store",
    })
    const stray = await openDB("stray-db", 1, {
      upgrade(database) {
        database.createObjectStore("stray-store")
      },
    })
    stray.close()

    // When everything is cleared
    await idbService.deleteAll()

    // Then the unregistered database still exists
    const remaining = (await global.indexedDB.databases()).map(
      (entry) => entry.name,
    )
    expect(remaining).toContain("stray-db")
    expect(remaining).not.toContain("registered-db")
  })
})

function realDeleteDb(
  ...args: Parameters<typeof deleteDB>
): ReturnType<typeof deleteDB> {
  return jest.requireActual<typeof import("idb")>("idb").deleteDB(...args)
}
