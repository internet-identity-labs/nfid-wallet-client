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

  it("should skip a [DISK]-only store during migrateAllToMemory", async () => {
    // Given a [DISK]-only store seeded with a row
    const diskOnlyStore = new Storage<string>({
      dbName: "disk-only-migrate-db",
      storeName: "disk-only-store",
      persistenceType: [StorageMode.DISK],
    })
    await diskOnlyStore.set("key", "on-disk")
    const copySpy = jest.spyOn(diskOnlyStore, "copyToMemory")
    const commitSpy = jest.spyOn(diskOnlyStore, "commitToMemory")

    // When migration runs
    await idbService.migrateAllToMemory()

    // Then the disk-only store was never copied or committed to memory
    expect(copySpy).not.toHaveBeenCalled()
    expect(commitSpy).not.toHaveBeenCalled()
    expect(await diskOnlyStore.get("key")).toBe("on-disk")
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

  it("should leave a [DISK]-only store's database untouched", async () => {
    // Given a default-persistence store and a [DISK]-only store
    new Storage<string>({
      dbName: "deletable-db",
      storeName: "deletable-store",
    })
    new Storage<string>({
      dbName: "disk-only-db",
      storeName: "disk-only-store",
      persistenceType: [StorageMode.DISK],
    })

    // When everything migratable is deleted
    await idbService.deleteAll()

    // Then deleteDB was called for the default store's db but not the disk-only one
    const deletedNames = deleteDbMock.mock.calls.map((call) => call[0])
    expect(deletedNames).toContain("deletable-db")
    expect(deletedNames).not.toContain("disk-only-db")
  })
})

describe("idbService.deleteExternalDbs", () => {
  const externalDbNames = [
    "WALLET_CONNECT_V2_INDEXED_DB",
    "icp-sdk-ic0.app",
    "icp-sdk-icp-api.io",
  ]

  it("should delete all 3 hardcoded external database names", async () => {
    // Given all 3 external databases actually exist on disk
    await Promise.all(
      externalDbNames.map(async (name) => {
        const database = await openDB(name, 1, {
          upgrade(db) {
            db.createObjectStore("store")
          },
        })
        database.close()
      }),
    )

    // When deleteExternalDbs runs
    await idbService.deleteExternalDbs()

    // Then none of the 3 databases remain
    const remaining = (await global.indexedDB.databases()).map(
      (entry) => entry.name,
    )
    for (const name of externalDbNames) {
      expect(remaining).not.toContain(name)
    }
  })

  it("should still resolve when one of the 3 deletes fails", async () => {
    // Given every deleteDB call rejecting
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    deleteDbMock.mockRejectedValue(new Error("delete blocked past timeout"))

    // When deleteExternalDbs runs
    // Then it resolves instead of rejecting, and logs each failure
    await expect(idbService.deleteExternalDbs()).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledTimes(externalDbNames.length)
  })
})

function realDeleteDb(
  ...args: Parameters<typeof deleteDB>
): ReturnType<typeof deleteDB> {
  return jest.requireActual<typeof import("idb")>("idb").deleteDB(...args)
}
