import {
  domainKeyStorage,
  getFromStorage,
  saveToStorage,
} from "./domain-key-repository"
import { LocalStorageMock } from "./local-storage-mock"

describe("Storage Functions", () => {
  const localStorageMock = new LocalStorageMock()
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
  })

  beforeEach(() => {
    localStorageMock.clear()
  })

  it("saveToStorage saves data correctly", () => {
    saveToStorage("key1", "value1", 60)
    const storedData = JSON.parse(
      localStorageMock.getItem(domainKeyStorage) || "{}",
    )

    expect(storedData.key1.value).toBe("value1")
    expect(storedData.key1.expirationTimestamp).toBeGreaterThan(Date.now())
  })

  it("getFromStorage retrieves valid data", () => {
    saveToStorage("key2", "value2", 60)
    const retrievedValue = getFromStorage("key2")

    expect(retrievedValue).toBe("value2")
  })

  it("getFromStorage throws error for expired data", () => {
    saveToStorage("key3", "value3", -1) // Expiry set to past time
    expect(() => getFromStorage("key3")).toThrowError(
      "Value for key 'key3' has expired.",
    )
  })

  it("getFromStorage throws error for missing data", () => {
    expect(() => getFromStorage("nonExistentKey")).toThrowError(
      "Value for key 'nonExistentKey' not found.",
    )
  })
})
