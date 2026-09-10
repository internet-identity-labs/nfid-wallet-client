import { IdbKeyVal } from "./keyval/idb-keyval"
import { MemoryKeyVal } from "./keyval/memory-keyval"
import { idbService } from "./service/idb-service"
import { KeyValueStore } from "./types"

import { IdbStore } from "./idb-store"

class FakeStore extends IdbStore {
  get boundStore(): KeyValueStore | undefined {
    return this.initializedStore
  }

  get key(): string {
    return this.storeKey
  }

  get memory(): MemoryKeyVal {
    return this.memoryStore()
  }

  bindTo(store: KeyValueStore): void {
    this.initializedStore = store
  }
}

beforeEach(() => {
  global.indexedDB = new IDBFactory()
  idbService.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe("IdbStore", () => {
  it("should self-register with the idb service on construction", () => {
    // Given a new store bound to a { dbName, storeName } pair
    new FakeStore({ dbName: "fake-db", storeName: "fake-store" })

    // When the registered database names are read
    // Then the store's database is listed
    expect(idbService.getDbNames()).toContain("fake-db")
  })

  it("should copy every IndexedDB row into the cached MemoryKeyVal", async () => {
    // Given a store whose IndexedDB holds two rows
    const store = new FakeStore({ dbName: "copy-db", storeName: "copy-store" })
    const idbHandle = await IdbKeyVal.create({
      dbName: "copy-db",
      storeName: "copy-store",
      version: 1,
    })
    await idbHandle.set("alpha", "one")
    await idbHandle.set("beta", "two")
    idbHandle.close()

    // When the store copies itself to memory
    await store.copyToMemory()

    // Then the store's own MemoryKeyVal holds both rows
    const memory = store.memory
    expect(await memory.get("alpha")).toBe("one")
    expect(await memory.get("beta")).toBe("two")
  })

  it("should close its migration handle even when the copy read throws", async () => {
    // Given a store and a getAll that rejects during the copy
    const store = new FakeStore({
      dbName: "throw-db",
      storeName: "throw-store",
    })
    const closeSpy = jest.spyOn(IdbKeyVal.prototype, "close")
    jest
      .spyOn(IdbKeyVal.prototype, "getAll")
      .mockRejectedValueOnce(new Error("read failed"))

    // When copyToMemory runs
    await expect(store.copyToMemory()).rejects.toThrow("read failed")

    // Then the local handle was still closed and nothing was rebound
    expect(closeSpy).toHaveBeenCalled()
    expect(store.boundStore).toBeUndefined()
  })

  it("should rebind to the cached MemoryKeyVal and close the previous handle on commit", async () => {
    // Given a store currently bound to an on-disk handle
    const store = new FakeStore({
      dbName: "commit-db",
      storeName: "commit-store",
    })
    const idbHandle = await IdbKeyVal.create({
      dbName: "commit-db",
      storeName: "commit-store",
      version: 1,
    })
    const closeSpy = jest.spyOn(idbHandle, "close")
    store.bindTo(idbHandle)

    // When the commit runs
    store.commitToMemory()

    // Then it is bound to its own MemoryKeyVal and the old handle was closed
    expect(store.boundStore).toBe(store.memory)
    expect(closeSpy).toHaveBeenCalled()
  })

  it("should drop the bound instance on rebindToDisk", () => {
    // Given a store bound to some backing
    const store = new FakeStore({
      dbName: "rebind-db",
      storeName: "rebind-store",
    })
    store.bindTo(store.memory)

    // When it is rebound to disk
    store.rebindToDisk()

    // Then the next access has to re-open a fresh handle
    expect(store.boundStore).toBeUndefined()
  })

  it("should hand out the same MemoryKeyVal instance on repeated memoryStore() calls", () => {
    // Given a store
    const store = new FakeStore({ dbName: "same-db", storeName: "same-store" })

    // Then its in-memory backing is stable
    expect(store.memory).toBe(store.memory)
  })

  it("should give each store its own distinct MemoryKeyVal", () => {
    // Given two stores
    const first = new FakeStore({ dbName: "a-db", storeName: "a-store" })
    const second = new FakeStore({ dbName: "b-db", storeName: "b-store" })

    // Then they do not share an in-memory backing
    expect(second.memory).not.toBe(first.memory)
  })

  it("should swap in a fresh MemoryKeyVal on clearMemory()", () => {
    // Given a store with an established in-memory backing
    const store = new FakeStore({
      dbName: "reset-db",
      storeName: "reset-store",
    })
    const before = store.memory

    // When its memory is cleared
    store.clearMemory()

    // Then the next request builds a new one
    expect(store.memory).not.toBe(before)
  })
})
