import { LocalStorageWithFallback } from "./with-fallback"

// Adjust the import path as needed

describe("LocalStorageProxy", () => {
  let storage: LocalStorageWithFallback

  beforeEach(() => {
    storage = new LocalStorageWithFallback()
  })

  afterEach(() => {
    storage.clear()
  })

  it("should set and get items in localStorage", () => {
    storage.setItem("testKey", "testValue")
    expect(storage.getItem("testKey")).toBe("testValue")
  })

  it("should set and get items in incognito mode", () => {
    // Simulate incognito mode by forcing the class to use Map
    storage["hasLocalStorage"] = true

    storage.setItem("testKey", "testValue")
    expect(storage.getItem("testKey")).toBe("testValue")
  })

  it("should remove items from localStorage", () => {
    storage.setItem("testKey", "testValue")
    storage.removeItem("testKey")
    expect(storage.getItem("testKey")).toBeNull()
  })

  it("should remove items in incognito mode", () => {
    // Simulate incognito mode by forcing the class to use Map
    storage["hasLocalStorage"] = true

    storage.setItem("testKey", "testValue")
    storage.removeItem("testKey")
    expect(storage.getItem("testKey")).toBeNull()
  })

  it("should clear localStorage", () => {
    storage.setItem("testKey1", "testValue1")
    storage.setItem("testKey2", "testValue2")
    storage.clear()
    expect(storage.length).toBe(0)
  })

  it("should clear data in incognito mode", () => {
    // Simulate incognito mode by forcing the class to use Map
    storage["hasLocalStorage"] = true

    storage.setItem("testKey1", "testValue1")
    storage.setItem("testKey2", "testValue2")
    storage.clear()
    expect(storage.length).toBe(0)
  })
})
