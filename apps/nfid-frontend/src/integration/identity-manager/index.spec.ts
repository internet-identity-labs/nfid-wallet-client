/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { im, im as imMock, RootWallet } from "@nfid/integration"

import { Application } from "frontend/integration/_ic_api/identity_manager.d"
import {
  createNFIDProfile,
  processApplicationOrigin,
  update2fa,
} from "frontend/integration/identity-manager/index"

describe("Identity Manager suite", () => {
  jest.setTimeout(80000)

  describe("Identity Manager Service Test", () => {
    it("Should create NFID profile", async function () {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const sessionKey = Ed25519KeyIdentity.generate()
      const chain = await DelegationChain.create(
        mockedIdentity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )
      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chain,
      )
      const nfidProfile = await createNFIDProfile(delegationIdentity)
      expect(nfidProfile.anchor).not.toEqual(BigInt(0))
      expect(nfidProfile.wallet).toEqual(RootWallet.NFID)
      expect(nfidProfile.accessPoints.length).toEqual(1)
      const identityDevice = Ed25519KeyIdentity.generate()
      const deviceData = {
        icon: "Icon",
        device: "Global",
        pub_key: identityDevice.getPrincipal().toText(),
        browser: "Her",
        device_type: {
          Passkey: null,
        },
      }
      await im.create_access_point(deviceData)
      const updatedProfile = await update2fa(true)
      expect(updatedProfile.is2fa).toEqual(true)
    })

    it("Should create application", async function () {
      // @ts-ignore
      imMock.get_application = jest.fn(() => Promise.resolve({ data: [] }))
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appName")
      expect(imMock.update_application_alias).toBeCalled()
    })
    it("Should update origin", async function () {
      const application: Application = {
        is_nft_storage: [],
        is_trusted: [],
        is_iframe_allowed: [],
        alias: [["appAlias"]],
        user_limit: 5,
        domain: "domain",
        name: "appName",
        img: [],
      }
      // @ts-ignore
      imMock.get_application = jest.fn(() =>
        Promise.resolve({ data: [application] }),
      )
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appAliasAnother", "test")
      expect(imMock.update_application_alias).toBeCalled()
    })
    it("Should skip", async function () {
      const application: Application = {
        is_nft_storage: [],
        is_trusted: [],
        is_iframe_allowed: [],
        alias: [["appAlias"]],
        user_limit: 5,
        domain: "domain",
        name: "appName",
        img: [],
      }
      // @ts-ignore
      imMock.get_application = jest.fn(() =>
        Promise.resolve({ data: [application] }),
      )
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appAlias")
      expect(imMock.update_application_alias).toBeCalledTimes(0)
    })
  })
})
