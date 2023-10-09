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
  Application,
  authState as authStateMock,
  extendWithFixedAccounts,
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
import { fetchAccounts } from "frontend/integration/identity-manager/index"
import * as ed25519Mock from "frontend/integration/internet-identity/crypto/ed25519"
import * as iiIndexMock from "frontend/integration/internet-identity/index"
import { hasOwnProperty } from "frontend/integration/internet-identity/utils"

import { getWalletPrincipal } from "../rosetta/get-wallet-principal"
import { registerIIAccount } from "../test-util"

describe("Facade suite", () => {
  jest.setTimeout(100000)

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
      await im.create_account({
        anchor,
        access_point: [],
        wallet: [],
        email: [],
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
      im.use_access_point = jest.fn((x: [] | [string]) => ({
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
      await im.create_account({
        anchor,
        access_point: [],
        wallet: [],
        email: [],
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
      const nfid: Application = {
        accountLimit: 1,
        alias: [],
        domain: "nfid.one",
        isNftStorage: true,
        isIFrameAllowed: false,
        name: "NFID",
      }
      const appRequired: Application = {
        accountLimit: 0,
        alias: [],
        domain: "requiredDomain",
        isNftStorage: true,
        isIFrameAllowed: false,
        name: "",
      }
      const appDuplicated: Application = {
        accountLimit: 0,
        alias: [],
        domain: "duplicatedDomain",
        isNftStorage: true,
        isIFrameAllowed: false,
        name: "",
      }
      const appNotRequired: Application = {
        accountLimit: 0,
        alias: [],
        domain: "notRequiredDomain",
        isNftStorage: false,
        isIFrameAllowed: false,
        name: "",
      }
      const userAccounts = await fetchAccounts()
      const accountsIncludingStaticApps = extendWithFixedAccounts(
        userAccounts,
        [nfid, appRequired, appNotRequired, appDuplicated],
      )
      authStateMock.set({
        identity: mockedIdentity,
        delegationIdentity: delegationIdentity,
      })
      const principals: { principal: Principal; account: Account }[] =
        await fetchPrincipals(anchor, accountsIncludingStaticApps)

      expect(
        principals.filter((p) => p.account.domain === "test").length,
      ).toEqual(2)
      expect(
        principals.filter((p) => p.account.domain === "oneMoreTest").length,
      ).toEqual(1)
      expect(
        principals.filter((p) => p.account.domain === "requiredDomain").length,
      ).toEqual(1)
      expect(
        principals.filter((p) => p.account.domain === "duplicatedDomain")
          .length,
      ).toEqual(2)
      expect(
        principals.filter((p) => p.account.domain === "notRequiredDomain"),
      ).toEqual([])
      const walletPrincipal = await getWalletPrincipal(Number(anchor))
      expect(
        principals.find(
          (x) => x.principal.toText() === walletPrincipal.toText(),
        ),
      ).toBeDefined()
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
      im.use_access_point = jest.fn((x: [] | [string]) => ({
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
