/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import {
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii, im, replaceIdentity } from "frontend/integration/actors"
import { removeRecoveryDeviceFacade } from "frontend/integration/facade/index"
import * as ed25519Mock from "frontend/integration/internet-identity/crypto/ed25519"
import * as iiIndexMock from "frontend/integration/internet-identity/index"
import {
  authState as authStateMock,
  FrontendDelegation,
} from "frontend/integration/internet-identity/index"
import { hasOwnProperty } from "frontend/integration/internet-identity/utils"

import {
  generateDelegationIdentity,
  registerIIAccount,
} from "../../../test/steps/support/integration/test-util"

describe("Facade suite", () => {
  jest.setTimeout(80000)

  describe("Facade Service Test", () => {
    it("Should create and remove protected Recovery device", async function () {
      let mockedIdentity = Ed25519KeyIdentity.generate()
      const delegationIdentity: DelegationIdentity =
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
      const recoveryIdentity: DelegationIdentity =
        await generateDelegationIdentity(recoveryDevice)
      await im.create_account({ anchor })
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
        pub_key: Array.from(
          new Uint8Array(recoveryDevice.getPublicKey().toDer()),
        ),
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
      im.use_access_point = jest.fn(() => ({ catch: jest.fn() }))
      authStateMock.set(recoveryDevice, recoveryIdentity, ii)
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
      expect((await im.read_access_points()).data[0]).toEqual([])
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
      im.use_access_point = jest.fn(() => ({ catch: jest.fn() }))
      authStateMock.set(mockedIdentity, delegationIdentity, ii)
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
