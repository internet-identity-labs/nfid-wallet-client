/**
 * @jest-environment jsdom
 */
import { getEcdsaPublicKey, signEcdsaMessage } from "./index"

describe("ECDSA suite", () => {
  jest.setTimeout(200000)
  it("ecdsa public key", async () => {
    const pk = await getEcdsaPublicKey()
    expect(pk.length > 0).toBe(true)
  })
  it("ecdsa sign message", async () => {
    const message = Array(32).fill(1)
    const signature = await signEcdsaMessage(message)
    expect(signature.length > 0).toBe(true)
  })
})
