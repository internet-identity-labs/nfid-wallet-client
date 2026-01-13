/**
 * @jest-environment jsdom
 */
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"

import {
  authState as authStateMock,
  ii,
  im,
  replaceIdentity,
  FrontendDelegation,
  generateDelegationIdentity,
} from "@nfid/integration"

import { DeviceData } from "frontend/integration/_ic_api/internet_identity.d"
import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
import { AUTHENTICATOR_DEVICES } from "frontend/integration/internet-identity/__mocks"
import * as ed25519Mock from "frontend/integration/internet-identity/crypto/ed25519"
import * as iiIndexMock from "frontend/integration/internet-identity/index"
import {
  Device,
  getMultiIdent,
} from "frontend/integration/internet-identity/index"
import { hasOwnProperty } from "frontend/integration/internet-identity/utils"

import { registerIIAccount } from "../test-util"

describe.skip("ii suite", () => {
  jest.setTimeout(50000)

  describe("II Service Test", () => {
    it("Should create protected Recovery device", async () => {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity } =
        await generateDelegationIdentity(mockedIdentity)
      replaceIdentity(delegationIdentity)
      const deviceData: DeviceData = {
        alias: "Device",
        protection: { unprotected: null },
        pubkey: Array.from(
          new Uint8Array(mockedIdentity.getPublicKey().toDer()),
        ),
        key_type: { platform: null },
        purpose: { authentication: null },
        credential_id: [],
      }
      const anchor = await registerIIAccount(mockedIdentity, deviceData)
      const recoveryDevice = Ed25519KeyIdentity.generate()
      await iiIndexMock.addDevice(
        anchor,
        "DeviceRecoveryTest",
        { seed_phrase: null },
        { recovery: null },
        recoveryDevice.getPublicKey().toDer(),
      )
      //verify protected recovery phrase
      const recoveryPhraseDeviceData = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => hasOwnProperty(d.purpose, "recovery")),
        )) as DeviceData

      expect(
        hasOwnProperty(recoveryPhraseDeviceData.protection, "protected"),
      ).toEqual(true)
      await iiIndexMock.addDevice(
        anchor,
        "DeviceRecoveryNotSeedPhrase",
        { platform: null },
        { recovery: null },
        Ed25519KeyIdentity.generate().getPublicKey().toDer(),
      )
      //verify auth device unprotected
      const authDevice = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => d.alias === "DeviceRecoveryNotSeedPhrase"),
        )) as DeviceData
      expect(hasOwnProperty(authDevice.protection, "unprotected")).toEqual(true)
    })

    it("should protect Unprotect Recovery Device", async () => {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const { delegationIdentity: delegationIdentityDummy } =
        await generateDelegationIdentity(mockedIdentity)
      const deviceData: DeviceData = {
        alias: "Device",
        protection: { unprotected: null },
        pubkey: Array.from(
          new Uint8Array(mockedIdentity.getPublicKey().toDer()),
        ),
        key_type: { seed_phrase: null },
        purpose: { recovery: null },
        credential_id: [],
      }
      replaceIdentity(delegationIdentityDummy)
      const anchor = await registerIIAccount(mockedIdentity, deviceData)
      const recoveryPhraseDeviceData = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => hasOwnProperty(d.purpose, "recovery")),
        )) as DeviceData

      expect(
        hasOwnProperty(recoveryPhraseDeviceData.protection, "unprotected"),
      ).toEqual(true)

      const chain = await DelegationChain.create(
        delegationIdentityDummy,
        mockedIdentity.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
      )
      const feDelegation: FrontendDelegation = {
        chain,
        sessionKey: mockedIdentity,
        delegationIdentity: delegationIdentityDummy,
      }
      // @ts-ignore
      im.use_access_point = jest.fn((_x: [] | [string]) => ({
        catch: jest.fn(),
      }))
      authStateMock.set({
        identity: mockedIdentity,
        delegationIdentity: delegationIdentityDummy,
      })
      // @ts-ignore
      ed25519Mock.fromMnemonicWithoutValidation = jest.fn(() =>
        Promise.resolve(mockedIdentity),
      )
      // @ts-ignore
      iiIndexMock.requestFEDelegation = jest
        .fn()
        .mockReturnValue(Promise.resolve(feDelegation))
      // @ts-ignore
      await iiIndexMock.protectRecoveryPhrase(anchor, "someStringForNow")
      const updatedRecovery = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => hasOwnProperty(d.purpose, "recovery")),
        )) as DeviceData
      expect(hasOwnProperty(updatedRecovery.protection, "protected")).toEqual(
        true,
      )
    })

    describe("getMultiIdent test suite", () => {
      it("should create MultiWebAuthnIdentity", () => {
        MultiWebAuthnIdentity.fromCredentials = jest.fn()
        getMultiIdent(AUTHENTICATOR_DEVICES as Device[])
        expect(MultiWebAuthnIdentity.fromCredentials).toHaveBeenCalledWith(
          [
            {
              credentialId: Buffer.from(AUTHENTICATOR_DEVICES[0].credentialId),
              pubkey: new ArrayBuffer(1),
            },
            {
              credentialId: Buffer.from(AUTHENTICATOR_DEVICES[1].credentialId),
              pubkey: new ArrayBuffer(1),
            },
          ],
          undefined,
        )
      })
    })
  })
})
