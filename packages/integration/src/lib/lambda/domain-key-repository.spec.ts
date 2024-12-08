import {
  deleteFromStorage,
  getFromStorage,
  saveToStorage,
} from "./domain-key-repository"
import { domainKeyStorage } from "./domain-key-storage"

describe("Storage Functions", () => {
  beforeEach(async () => {
    await domainKeyStorage.clear()
  })

  it("saveToStorage saves data correctly", async () => {
    await saveToStorage("key1", "value1", 60)
    const storedData =
      (await domainKeyStorage.getEvenExpired("key1")) ||
      ({} as { value: string; expired: boolean })

    expect(storedData.value).toBe("value1")
    expect(storedData.expired).toBeFalsy()
  })

  it("getFromStorage retrieves valid data", async () => {
    await saveToStorage("key2", "value2", 60)
    const retrievedValue = await getFromStorage("key2")

    expect(retrievedValue).toBe("value2")
  })

  it("getFromStorage throws error for expired data", async () => {
    await saveToStorage("key3", "value3", -1) // Expiry set to past time
    expect(getFromStorage("key3")).rejects.toThrow(
      "Value for key 'key3' has expired.",
    )
  })

  it("getFromStorage throws error for missing data", async () => {
    expect(getFromStorage("nonExistentKey")).rejects.toThrow(
      "Value for key 'nonExistentKey' not found.",
    )
  })

  it("deleteFromStorage removes data correctly", async () => {
    await saveToStorage("key4", "value4", 60)
    await deleteFromStorage("key4")
    const storedData = await domainKeyStorage.getEvenExpired("key4")
    expect(storedData).toBeNull()
  })
})
