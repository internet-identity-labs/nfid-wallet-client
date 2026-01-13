import nodeCrypto from "crypto"
import "fake-indexeddb/auto"

import { IdbKeyVal } from "./idb-keyval"

let testCounter = 0

const testDb = async () => {
  return await IdbKeyVal.create({
    dbName: `db-${testCounter}`,
    storeName: `store-${testCounter}`,
  })
}

beforeEach(() => {
  testCounter += 1
})

describe("indexeddb wrapper", () => {
  it("should store a basic key value", async () => {
    const db = await testDb()
    const shouldSet = async () => await db.set("testKey", "testValue")
    expect(shouldSet).not.toThrow()

    expect(await db.get("testKey")).toBe("testValue")
  })
  it("should support removing a value", async () => {
    const db = await testDb()
    await db.set("testKey", "testValue")

    expect(await db.get("testKey")).toBe("testValue")

    await db.remove("testKey")

    expect(await db.get("testKey")).toBe(null)
  })
  it("should support storing a CryptoKeyPair", async () => {
    const db = await testDb()
    const keyPair = await nodeCrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: "SHA-256" },
      },
      true,
      ["encrypt", "decrypt"],
    )
    await db.set("testKey", keyPair)
    const storedKey = (await db.get("testKey")) as CryptoKeyPair

    expect(JSON.stringify(storedKey)).toBe(JSON.stringify(keyPair))
  })
})
