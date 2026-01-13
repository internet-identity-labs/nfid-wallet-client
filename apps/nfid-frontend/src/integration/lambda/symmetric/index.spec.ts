/**
 * @jest-environment jsdom
 */
import { createCipheriv } from "crypto"

import { Ed25519KeyIdentity } from "@dfinity/identity"

import { expect } from "@jest/globals"

import { generateDelegationIdentity, replaceIdentity } from "@nfid/integration"

import {
  decryptStringForIdentity,
  symmetric,
} from "frontend/integration/lambda/symmetric"
import { registerIIAndIM } from "frontend/integration/test-util"

describe.skip("symmetric suite", () => {
  jest.setTimeout(50000)

  describe("Symmetric Key Service Test", () => {
    it("Create account and retrieve same key + encrypt/decrypt", async () => {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity } =
        await generateDelegationIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      await registerIIAndIM(mockedIdentity)
      const key = await symmetric(delegationIdentity)
      expect(typeof key).toBe("string")
      const haveToBeSameKey = await symmetric(delegationIdentity)
      expect(key).toEqual(haveToBeSameKey)
      console.log(key)
      //wrap in same test to save time on registration
      const phoneNumber = "+380501111111"
      const encrypted = encrypt(phoneNumber, key)
      console.log(encrypted)

      const decrypted = await decryptStringForIdentity(
        encrypted,
        delegationIdentity,
      )

      expect(phoneNumber).toEqual(decrypted)
    })

    it("Catch error if not registered account", async () => {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity } =
        await generateDelegationIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      await expect(symmetric(delegationIdentity)).rejects.toThrow(
        "There was an issue getting symmetric key.",
      )
    })
  })

  function encrypt(value: string, key: string) {
    const secretBuffer = Buffer.from(key, "hex")
    const cipher = createCipheriv("aes-256-ecb", secretBuffer, "")
    let cipherText = cipher.update(value, "utf8", "hex")
    cipherText += cipher.final("hex")
    return cipherText
  }
})
