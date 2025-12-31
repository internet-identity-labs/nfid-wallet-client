/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { expect } from "@jest/globals"
import { createCipheriv } from "crypto"

import { generateDelegationIdentity, replaceIdentity } from "@nfid/integration"

import {
  decryptStringForIdentity,
  symmetric,
} from "frontend/integration/lambda/symmetric"
import { registerIIAndIM } from "frontend/integration/test-util"

describe.skip("symmetric suite", () => {
  jest.setTimeout(50000)

  describe("Symmetric Key Service Test", () => {
    it("Create account and retrieve same key + encrypt/decrypt", async function () {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity } =
        await generateDelegationIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      await registerIIAndIM(mockedIdentity)
      let key = await symmetric(delegationIdentity)
      expect(typeof key).toBe("string")
      let haveToBeSameKey = await symmetric(delegationIdentity)
      expect(key).toEqual(haveToBeSameKey)
      console.log(key)
      //wrap in same test to save time on registration
      let phoneNumber = "+380501111111"
      let encrypted = encrypt(phoneNumber, key)
      console.log(encrypted)

      let decrypted = await decryptStringForIdentity(
        encrypted,
        delegationIdentity,
      )

      expect(phoneNumber).toEqual(decrypted)
    })

    it("Catch error if not registered account", async () => {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity } =
        await generateDelegationIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      await expect(symmetric(delegationIdentity)).rejects.toThrow(
        "There was an issue getting symmetric key.",
      )
    })
  })

  function encrypt(value: string, key: string) {
    let secretBuffer = Buffer.from(key, "hex")
    let cipher = createCipheriv("aes-256-ecb", secretBuffer, "")
    let cipherText = cipher.update(value, "utf8", "hex")
    cipherText += cipher.final("hex")
    return cipherText
  }
})
