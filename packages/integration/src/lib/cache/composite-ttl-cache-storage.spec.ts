import { CompositeTtlCacheStorage } from "./composite-ttl-cache-storage"
import { ICacheItem } from "node-ts-cache"
import { Storage } from "@nfid/client-db"

interface TestCacheItem extends ICacheItem {
  content: string
}

describe("CompositeTtlCacheStorage", () => {
  let storage: CompositeTtlCacheStorage<TestCacheItem>
  let mockStorage: jest.Mocked<Storage<TestCacheItem>>
  let dateNowSpy: jest.SpyInstance

  const createCacheItem = (
    content: string,
    createdAt: number,
    ttl: number,
  ): TestCacheItem => ({
    content,
    meta: {
      createdAt,
      ttl,
    },
  })

  beforeEach(() => {
    mockStorage = {
      getAll: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
      clear: jest.fn(),
    } as any

    storage = new CompositeTtlCacheStorage(mockStorage)

    dateNowSpy = jest.spyOn(Date, "now")
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
  })

  describe("getItem()", () => {
    it("should return undefined for non-existent key", async () => {
      // Given: empty storage
      mockStorage.getAll.mockResolvedValue([])

      // When: getItem is called with non-existent key
      const result = await storage.getItem("non-existent")

      // Then: should return undefined
      expect(result).toBeUndefined()
    })

    it("should lazy-load from storage and populate memory cache on first access", async () => {
      // Given: storage contains items
      dateNowSpy.mockReturnValue(1000)
      const item1 = createCacheItem("value1", 0, 5000)
      const item2 = createCacheItem("value2", 0, 5000)
      mockStorage.getAll.mockResolvedValue([
        { key: "key1", value: item1 },
        { key: "key2", value: item2 },
      ])

      // When: first getItem is called
      const result = await storage.getItem("key1")

      // Then: should call storage.getAll and populate memory cache
      expect(mockStorage.getAll).toHaveBeenCalledTimes(1)
      expect(result).toEqual(item1)
    })

    it("should use memory cache without calling storage on subsequent access", async () => {
      // Given: memory cache is already populated
      dateNowSpy.mockReturnValue(1000)
      const item1 = createCacheItem("value1", 0, 5000)
      mockStorage.getAll.mockResolvedValue([{ key: "key1", value: item1 }])
      await storage.getItem("key1")
      mockStorage.getAll.mockClear()

      // When: subsequent getItem is called
      const result = await storage.getItem("key1")

      // Then: should not call storage.getAll again
      expect(mockStorage.getAll).not.toHaveBeenCalled()
      expect(result).toEqual(item1)
    })

    it("should remove expired items during lazy load and cache only valid ones", async () => {
      // Given: storage contains mix of expired and valid items
      dateNowSpy.mockReturnValue(10000)
      const expiredItem = createCacheItem("expired", 0, 5000) // Expired: 0 + 5000 < 10000
      const validItem = createCacheItem("valid", 5000, 10000) // Valid: 5000 + 10000 > 10000
      mockStorage.getAll.mockResolvedValue([
        { key: "expired-key", value: expiredItem },
        { key: "valid-key", value: validItem },
      ])

      // When: getItem is called
      await storage.getItem("valid-key")

      // Then: should remove expired items and cache only valid ones
      expect(mockStorage.removeAll).toHaveBeenCalledWith(["expired-key"])
      const validResult = await storage.getItem("valid-key")
      const expiredResult = await storage.getItem("expired-key")
      expect(validResult).toEqual(validItem)
      expect(expiredResult).toBeUndefined()
    })
  })

  describe("setItem()", () => {
    it("should persist to both storage and memory cache", async () => {
      // Given: a valid item
      const item = createCacheItem("value", 0, 5000)

      // When: setItem is called
      await storage.setItem("key", item)

      // Then: should persist to storage and memory cache
      expect(mockStorage.set).toHaveBeenCalledWith("key", item)
      mockStorage.getAll.mockResolvedValue([{ key: "key", value: item }])
      const result = await storage.getItem("key")
      expect(result).toEqual(item)
    })

    it("should update both layers when overwriting existing item", async () => {
      // Given: existing item in cache
      dateNowSpy.mockReturnValue(1000)
      const oldItem = createCacheItem("old", 0, 5000)
      mockStorage.getAll.mockResolvedValue([{ key: "key", value: oldItem }])
      await storage.getItem("key")

      // When: setItem is called with new value
      const newItem = createCacheItem("new", 1000, 5000)
      await storage.setItem("key", newItem)

      // Then: should update both storages
      expect(mockStorage.set).toHaveBeenCalledWith("key", newItem)
      const result = await storage.getItem("key")
      expect(result).toEqual(newItem)
    })

    it("should remove from both layers when value is undefined", async () => {
      // Given: existing item in cache
      dateNowSpy.mockReturnValue(1000)
      const item = createCacheItem("value", 0, 5000)
      mockStorage.getAll.mockResolvedValue([{ key: "key", value: item }])
      await storage.getItem("key")

      // When: setItem is called with undefined
      await storage.setItem("key", undefined)

      // Then: should remove from both layers
      expect(mockStorage.remove).toHaveBeenCalledWith("key")
      // Verify it's removed from memory cache by checking directly without re-fetching
      mockStorage.getAll.mockResolvedValue([]) // Storage no longer has the item
      const result = await storage.getItem("key")
      expect(result).toBeUndefined()
    })
  })

  describe("clear()", () => {
    it("should clear both storage and memory cache", async () => {
      // Given: populated caches
      dateNowSpy.mockReturnValue(1000)
      const item = createCacheItem("value", 0, 5000)
      mockStorage.getAll.mockResolvedValue([{ key: "key", value: item }])
      await storage.getItem("key")

      // When: clear is called
      await storage.clear()

      // Then: should clear both layers
      expect(mockStorage.clear).toHaveBeenCalledTimes(1)
      mockStorage.getAll.mockResolvedValue([])
      const result = await storage.getItem("key")
      expect(result).toBeUndefined()
    })

    it("should handle empty state without error", async () => {
      // Given: no items in storage
      // When: clear is called
      await storage.clear()

      // Then: should complete without error
      expect(mockStorage.clear).toHaveBeenCalledTimes(1)
    })
  })

  describe("concurrency safety", () => {
    it("should preserve concurrent writes during initialization", async () => {
      // Given: empty storage, slow initial load
      dateNowSpy.mockReturnValue(1000)
      const item1 = createCacheItem("value1", 0, 5000)
      const item2 = createCacheItem("value2", 0, 5000)

      mockStorage.getAll.mockImplementation(async () => {
        // Simulate slow load
        await new Promise((resolve) => setTimeout(resolve, 50))
        return [{ key: "key1", value: item1 }]
      })

      // When: concurrent getItem and setItem during initialization
      const getPromise = storage.getItem("key1")
      const setPromise = storage.setItem("key2", item2)

      await Promise.all([getPromise, setPromise])

      // Then: setItem value should not be lost
      const result = await storage.getItem("key2")
      expect(result).toEqual(item2)
      expect(mockStorage.set).toHaveBeenCalledWith("key2", item2)
    })

    it("should serialize operations in FIFO order", async () => {
      // Given: operations that track execution order
      const order: string[] = []

      mockStorage.set.mockImplementation(async (key: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        order.push(key as string)
      })

      // When: multiple setItem operations are queued
      const promise1 = storage.setItem(
        "key1",
        createCacheItem("value1", 0, 5000),
      )
      const promise2 = storage.setItem(
        "key2",
        createCacheItem("value2", 0, 5000),
      )
      const promise3 = storage.setItem(
        "key3",
        createCacheItem("value3", 0, 5000),
      )

      await Promise.all([promise1, promise2, promise3])

      // Then: operations should execute in FIFO order
      expect(order).toEqual(["key1", "key2", "key3"])
    })

    it("should isolate errors and continue processing queue", async () => {
      // Given: an operation that will fail
      dateNowSpy.mockReturnValue(1000)
      mockStorage.set.mockRejectedValueOnce(new Error("Storage error"))

      // When: multiple operations including one that fails
      const item1 = createCacheItem("value1", 0, 5000)
      const item2 = createCacheItem("value2", 0, 5000)

      const failedPromise = storage.setItem("key1", item1)
      const successPromise = storage.setItem("key2", item2)

      // Then: first operation should fail
      await expect(failedPromise).rejects.toThrow("Storage error")

      // But second operation should succeed
      await expect(successPromise).resolves.toBeUndefined()
      expect(mockStorage.set).toHaveBeenCalledWith("key2", item2)
    })

    it("should call storage.getAll only once for concurrent getItem calls", async () => {
      // Given: empty memory cache
      dateNowSpy.mockReturnValue(1000)
      const item1 = createCacheItem("value1", 0, 5000)
      const item2 = createCacheItem("value2", 0, 5000)
      mockStorage.getAll.mockResolvedValue([
        { key: "key1", value: item1 },
        { key: "key2", value: item2 },
      ])

      // When: concurrent getItem calls are made
      const [result1, result2] = await Promise.all([
        storage.getItem("key1"),
        storage.getItem("key2"),
      ])

      // Then: storage.getAll should be called only once
      expect(mockStorage.getAll).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(item1)
      expect(result2).toEqual(item2)
    })
  })
})
