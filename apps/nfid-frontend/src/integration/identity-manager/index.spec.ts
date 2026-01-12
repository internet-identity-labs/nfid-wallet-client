/**
 * @jest-environment jsdom
 */
import {
  DeviceType,
  Icon,
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

const applicationStub: Application = {
  is_nft_storage: [],
  is_trusted: [],
  is_iframe_allowed: [],
  alias: [["appAlias"]],
  user_limit: 5,
  domain: "domain",
  name: "appName",
  img: [],
}

const okAppResponseEmpty = () => ({
  data: [] as [],
  error: [] as [],
  status_code: 200,
})

const okAppResponseOne = (app: Application) => ({
  data: [app] as [Application],
  error: [] as [],
  status_code: 200,
})

const okBoolResponse = () => ({
  data: [true] as [boolean],
  error: [] as [],
  status_code: 200,
})

describe("Identity Manager suite", () => {
  jest.setTimeout(300000)

  describe("Identity Manager Service Test", () => {
    it("Should create NFID profile", async function () {
      const identityDevice = getIdentity("87654321876543218765432187654318")
      const identityDeviceDelegationIdentity =
        await getDelegationIdentity(identityDevice)

      const mockedIdentity = getIdentity("87654321876543218765432187654311")
      const delegationIdentity = await getDelegationIdentity(mockedIdentity)

      await replaceActorIdentity(im, identityDeviceDelegationIdentity)
      // Optional disable.
      try {
        await update2fa(false)
      } catch (_e) {}

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
        deviceType: DeviceType.Google,
        icon: Icon.google,
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
      const getApplicationSpy = jest
        .spyOn(imMock, "get_application")
        .mockResolvedValue(okAppResponseEmpty())

      const updateAliasSpy = jest
        .spyOn(imMock, "update_application_alias")
        .mockResolvedValue(okBoolResponse())

      await processApplicationOrigin("domain", "appName")

      expect(updateAliasSpy).toHaveBeenCalled()

      getApplicationSpy.mockRestore()
      updateAliasSpy.mockRestore()
    })

    it("Should update origin", async function () {
      const getApplicationSpy = jest
        .spyOn(imMock, "get_application")
        .mockResolvedValue(okAppResponseOne(applicationStub))

      const updateAliasSpy = jest
        .spyOn(imMock, "update_application_alias")
        .mockResolvedValue(okBoolResponse())

      await processApplicationOrigin("domain", "appAliasAnother", "test")

      expect(updateAliasSpy).toHaveBeenCalled()

      getApplicationSpy.mockRestore()
      updateAliasSpy.mockRestore()
    })

    it("Should skip", async function () {
      const getApplicationSpy = jest
        .spyOn(imMock, "get_application")
        .mockResolvedValue(okAppResponseOne(applicationStub))

      const updateAliasSpy = jest
        .spyOn(imMock, "update_application_alias")
        .mockResolvedValue(okBoolResponse())

      await processApplicationOrigin("domain", "appAlias")

      expect(updateAliasSpy).not.toHaveBeenCalled()

      getApplicationSpy.mockRestore()
      updateAliasSpy.mockRestore()
    })
  })
})
