/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import {
  Account,
  authState as authStateMock,
  fetchPrincipals,
  generateDelegationIdentity,
} from "@nfid/integration"
import { ii, im, replaceIdentity } from "@nfid/integration"
import { FrontendDelegation } from "@nfid/integration"

import {
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
import { removeRecoveryDeviceFacade } from "frontend/integration/facade/index"
import * as ed25519Mock from "frontend/integration/internet-identity/crypto/ed25519"
import * as iiIndexMock from "frontend/integration/internet-identity/index"
import { hasOwnProperty } from "frontend/integration/internet-identity/utils"

import { registerIIAccount } from "../test-util"

describe.skip("Facade suite", () => {
  jest.setTimeout(100000)

  describe("Facade Service Test", () => {
    it("Should create and remove protected Recovery device", async function () {
      let mockedIdentity = Ed25519KeyIdentity.generate()
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
      let anchor = await registerIIAccount(mockedIdentity, deviceData)
      let recoveryDevice = Ed25519KeyIdentity.generate()
      const { delegationIdentity: recoveryIdentity } =
        await generateDelegationIdentity(recoveryDevice)
      await im.create_account({
        anchor,
        access_point: [],
        wallet: [],
        email: [],
        name: [],
        challenge_attempt: [],
      })
      await iiIndexMock.addDevice(
        anchor,
        "DeviceRecoveryTest",
        { seed_phrase: null },
        { recovery: null },
        recoveryDevice.getPublicKey().toDer(),
      )
      let accessPoints = await im.create_access_point({
        icon: "RecoveryTest",
        device: "RecoveryTest",
        browser: "RecoveryTest",
        pub_key: recoveryDevice.getPrincipal().toText(),
        device_type: { Recovery: null },
        credential_id: [],
      })
      // @ts-ignore
      expect(accessPoints.data[0][0].device).toEqual("RecoveryTest")
      let recoveryDeviceII = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => hasOwnProperty(d.purpose, "recovery")),
        )) as DeviceData
      expect(hasOwnProperty(recoveryDeviceII.protection, "protected")).toEqual(
        true,
      )

      //decrease test time. validate incorrect seed phrase
      await getErrorOnIncorrectSeedPhrase(
        mockedIdentity,
        delegationIdentity,
        anchor,
      )

      let chain = await DelegationChain.create(
        recoveryDevice,
        recoveryIdentity.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
      )
      let feDelegation: FrontendDelegation = {
        chain: chain,
        sessionKey: recoveryDevice,
        delegationIdentity: recoveryIdentity,
      }
      // @ts-ignore
      im.use_access_point = jest.fn((_x: [] | [string]) => ({
        catch: jest.fn(),
      }))
      authStateMock.set({
        identity: recoveryDevice,
        delegationIdentity: recoveryIdentity,
      })
      // @ts-ignore
      ed25519Mock.fromMnemonicWithoutValidation = jest.fn(() =>
        Promise.resolve(recoveryDevice),
      )
      // @ts-ignore
      iiIndexMock.requestFEDelegation = jest
        .fn()
        .mockReturnValue(Promise.resolve(feDelegation))
      await removeRecoveryDeviceFacade(anchor, "seedPhrase")
      let removedDevice = (await ii
        .lookup(anchor)
        .then((x) =>
          x.find((d) => hasOwnProperty(d.purpose, "recovery")),
        )) as DeviceData
      expect(removedDevice).toBe(undefined)
      replaceIdentity(delegationIdentity)
      let aps = await im.read_access_points()
      expect(aps.data[0]).toEqual([])
    })

    it("Should fetch principals", async function () {
      let mockedIdentity = Ed25519KeyIdentity.generate()
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
      let anchor = await registerIIAccount(mockedIdentity, deviceData)
      await im.create_account({
        anchor,
        access_point: [],
        wallet: [],
        email: [],
        name: [],
        challenge_attempt: [],
      })
      await im.create_access_point({
        browser: "",
        device: "",
        icon: "",
        pub_key: mockedIdentity.getPrincipal().toText(),
        device_type: { Recovery: null },
        credential_id: [],
      })
      await Promise.all([
        im.create_persona({
          domain: "test",
          persona_id: "1",
          persona_name: "",
        }),
        im.create_persona({
          domain: "test",
          persona_id: "2",
          persona_name: "",
        }),
        im.create_persona({
          domain: "oneMoreTest",
          persona_id: "1",
          persona_name: "",
        }),
        im.create_persona({
          domain: "duplicatedDomain",
          persona_id: "1",
          persona_name: "",
        }),
      ])
      authStateMock.set({
        identity: mockedIdentity,
        delegationIdentity: delegationIdentity,
      })
      const principals: { principal: Principal; account: Account }[] =
        await fetchPrincipals()

      expect(principals.length).toEqual(1)
    })

    async function getErrorOnIncorrectSeedPhrase(
      mockedIdentity: Ed25519KeyIdentity,
      delegationIdentity: DelegationIdentity,
      anchor: UserNumber,
    ) {
      let chain = await DelegationChain.create(
        mockedIdentity,
        mockedIdentity.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
      )
      let feDelegation: FrontendDelegation = {
        chain: chain,
        sessionKey: mockedIdentity,
        delegationIdentity: delegationIdentity,
      }
      // @ts-ignore
      im.use_access_point = jest.fn((_x: [] | [string]) => ({
        catch: jest.fn(),
      }))
      authStateMock.set({ identity: mockedIdentity, delegationIdentity })
      // @ts-ignore
      ed25519Mock.fromMnemonicWithoutValidation = jest.fn(() =>
        Promise.resolve(mockedIdentity),
      )
      // @ts-ignore
      iiIndexMock.requestFEDelegation = jest
        .fn()
        .mockReturnValue(Promise.resolve(feDelegation))
      try {
        await removeRecoveryDeviceFacade(anchor, "seedPhrase")
      } catch (e) {
        expect(
          (e as Error).message.includes(
            "Device is protected. Must be authenticated with this device to mutate",
          ),
        ).toBe(true)
      }
    }
  })
})
