/**
 * @jest-environment jsdom
 */
import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import {
  Challenge,
  ChallengeResult,
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii, replaceIdentity } from "frontend/integration/actors"
import * as iiIndexMock from "frontend/integration/internet-identity/index"
import * as ed25519Mock from "frontend/integration/internet-identity/crypto/ed25519"
import { FrontendDelegation, getMultiIdent } from "frontend/integration/internet-identity/index"
import { hasOwnProperty } from "frontend/integration/internet-identity/utils"
import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
import { II_DEVICES_DATA } from "frontend/integration/internet-identity/__mocks"


describe("ii suite", () => {
  jest.setTimeout(50000)

  describe("II Service Test", () => {
    it("should create MultiWebAuthnIdentity", async function() {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const delegationIdentity: DelegationIdentity = await generateIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      const deviceData: DeviceData = {
        alias: "Device",
        protection: { unprotected: null },
        pubkey: Array.from(new Uint8Array(mockedIdentity.getPublicKey().toDer())),
        key_type: { platform: null },
        purpose: { authentication: null },
        credential_id: [],
      }
      let anchor = await register(mockedIdentity, deviceData)
      let recoveryDevice = Ed25519KeyIdentity.generate()
      await iiIndexMock.addDevice(anchor,
        "DeviceRecoveryTest",
        { seed_phrase: null },
        { recovery: null },
        recoveryDevice.getPublicKey().toDer())
      //verify protected recovery phrase
      let recoveryPhraseDeviceData = await ii.lookup(anchor)
        .then((x) => x.find((d) => hasOwnProperty(d.purpose, "recovery"))) as DeviceData
      expect(hasOwnProperty(recoveryPhraseDeviceData.protection, "protected")).toEqual(true)
      await iiIndexMock.addDevice(anchor, "DeviceNotRecovery",
        { platform: null },
        { authentication: null },
        Ed25519KeyIdentity.generate().getPublicKey().toDer())
      //verify auth device unprotected
      let authDevice = await ii.lookup(anchor)
        .then((x) => x.find((d) => d.alias === "DeviceNotRecovery")) as DeviceData
      expect(hasOwnProperty(authDevice.protection, "unprotected")).toEqual(true)
    })

    it("should protect Unprotect Recovery Device", async function() {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const delegationIdentity1: DelegationIdentity = await generateIdentity(mockedIdentity)
      const deviceData: DeviceData = {
        alias: "Device",
        protection: { unprotected: null },
        pubkey: Array.from(new Uint8Array(mockedIdentity.getPublicKey().toDer())),
        key_type: { seed_phrase: null },
        purpose: { recovery: null },
        credential_id: [],
      }
      replaceIdentity(delegationIdentity1)
      let anchor = await register(mockedIdentity, deviceData)
      let recoveryPhraseDeviceData = await ii.lookup(anchor)
        .then((x) => x.find((d) => hasOwnProperty(d.purpose, "recovery"))) as DeviceData

      expect(hasOwnProperty(recoveryPhraseDeviceData.protection, "unprotected")).toEqual(true)

      let chain = await DelegationChain.create(delegationIdentity1, mockedIdentity.getPublicKey(), new Date(Date.now() + 3_600_000 * 44))
      let feDelegation: FrontendDelegation = {
        chain: chain,
        sessionKey: mockedIdentity,
        delegationIdentity: delegationIdentity1,
      }
      // @ts-ignore
      ed25519Mock.fromMnemonicWithoutValidation = jest.fn(() => Promise.resolve(mockedIdentity))
      // @ts-ignore
      iiIndexMock.requestFEDelegation = jest.fn().mockReturnValue(Promise.resolve(feDelegation))
      // @ts-ignore
      await iiIndexMock.protectRecoveryPhrase(anchor, "someStringForNow")
      let updatedRecovery = await ii.lookup(anchor)
        .then((x) => x.find((d) => hasOwnProperty(d.purpose, "recovery"))) as DeviceData
      expect(hasOwnProperty(updatedRecovery.protection, "protected")).toEqual(true)
    })

    describe("getMultiIdent test suite", () => {
      it("should create MultiWebAuthnIdentity", () => {
        MultiWebAuthnIdentity.fromCredentials = jest.fn()
        getMultiIdent(II_DEVICES_DATA as DeviceData[])
        expect(MultiWebAuthnIdentity.fromCredentials).toHaveBeenCalledWith(
          [
            {
              credentialId: Buffer.from(II_DEVICES_DATA[0].credential_id[0]),
              pubkey: new ArrayBuffer(1),
            },
            {
              credentialId: Buffer.from(II_DEVICES_DATA[1].credential_id[0]),
              pubkey: new ArrayBuffer(1),
            },
          ],
          undefined,
        )
      })
    })
  })

  async function register(identity: Ed25519KeyIdentity, deviceData: DeviceData) {
    const challenge: Challenge = (await ii.create_challenge()) as Challenge
    const challenageResult: ChallengeResult = {
      key: challenge.challenge_key,
      chars: "a",
    }
    const registerResponse = (await ii.register(
      deviceData,
      challenageResult,
    )) as { registered: { user_number: UserNumber } }
    return registerResponse.registered.user_number
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
