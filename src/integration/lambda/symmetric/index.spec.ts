/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { expect } from "@jest/globals"
import { createCipheriv } from "crypto"

import { HTTPAccountRequest } from "frontend/integration/_ic_api/identity_manager.did"
import {
  Challenge,
  ChallengeResult,
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii, im, replaceIdentity } from "frontend/integration/actors"
import {
  decryptStringForIdentity,
  symmetric,
} from "frontend/integration/lambda/symmetric"

describe("symmetric suite", () => {
  jest.setTimeout(50000)

  describe("Symmetric Key Service Test", () => {
    it("Create account and retrieve same key + encrypt/decrypt", async function () {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const delegationIdentity: DelegationIdentity = await generateIdentity(
        mockedIdentity,
      )
      replaceIdentity(delegationIdentity)
      await register(mockedIdentity)
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
      console.log(decrypted)

      expect(phoneNumber).toEqual(decrypted)
    })

    it("Catch error if not registered account", async () => {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const delegationIdentity: DelegationIdentity = await generateIdentity(
        mockedIdentity,
      )
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

  async function register(identity: Ed25519KeyIdentity) {
    const challenge: Challenge = (await ii.create_challenge()) as Challenge
    const challenageResult: ChallengeResult = {
      key: challenge.challenge_key,
      chars: "a",
    }
    const deviceData: DeviceData = {
      alias: "Device",
      protection: {
        unprotected: null,
      },
      pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
      key_type: {
        platform: null,
      },
      purpose: {
        authentication: null,
      },
      credential_id: [],
    }
    const registerResponse = (await ii.register(
      deviceData,
      challenageResult,
    )) as { registered: { user_number: UserNumber } }
    let anchor: UserNumber = registerResponse.registered.user_number
    let req: HTTPAccountRequest = {
      anchor: anchor,
    }
    await im.create_account(req)
  }

  async function generateIdentity(identity: Ed25519KeyIdentity) {
    const sessionKey = Ed25519KeyIdentity.generate()
    const chain = await DelegationChain.create(
      identity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    return DelegationIdentity.fromDelegation(sessionKey, chain)
  }
})
