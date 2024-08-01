/**
 * @jest-environment jsdom
 */
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import {
  im,
  im as imMock,
  replaceActorIdentity,
  RootWallet,
} from "@nfid/integration"

import { Application } from "frontend/integration/_ic_api/identity_manager.d"
import {
  createNFIDProfile,
  processApplicationOrigin,
  update2fa,
} from "frontend/integration/identity-manager/index"

import {
  getDelegationIdentity,
  getIdentity,
  getLambdaActor,
} from "../test-util"

describe("Identity Manager suite", () => {
  jest.setTimeout(100000)

  describe("Identity Manager Service Test", () => {
    it("Should create NFID profile", async function () {
      const identityDevice = getIdentity("87654321876543218765432187654318")
      const identityDeviceDelegationIdentity = await getDelegationIdentity(
        identityDevice,
      )

      const mockedIdentity = getIdentity("87654321876543218765432187654311")
      const delegationIdentity = await getDelegationIdentity(mockedIdentity)

      await replaceActorIdentity(im, identityDeviceDelegationIdentity)
      // Optional disable.
      try {
        await update2fa(false)
      } catch (e) {}

      await replaceActorIdentity(im, delegationIdentity)
      await im.remove_account()

      const email = "test@test.test"
      const principal = mockedIdentity.getPrincipal().toText()
      const lambdaActor = getLambdaActor()
      await lambdaActor.add_email_and_principal_for_create_account_validation(
        email,
        principal,
        new Date().getMilliseconds(),
      )

      const nfidProfile = await createNFIDProfile({
        delegationIdentity,
        email,
      })
      expect(nfidProfile.anchor).not.toEqual(BigInt(0))
      expect(nfidProfile.wallet).toEqual(RootWallet.NFID)
      expect(nfidProfile.accessPoints.length).toEqual(1)
      const deviceData = {
        icon: "Icon",
        device: "Global",
        pub_key: identityDevice.getPrincipal().toText(),
        browser: "Her",
        device_type: {
          Passkey: null,
        },
        credential_id: [],
      } as any
      await im.create_access_point(deviceData)
      const updatedProfile = await update2fa(true)
      expect(updatedProfile.is2fa).toEqual(true)

      await replaceActorIdentity(im, identityDeviceDelegationIdentity)
      await update2fa(false)

      await replaceActorIdentity(im, delegationIdentity)
      await im.remove_account()
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
