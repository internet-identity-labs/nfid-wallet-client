import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { addTentativeDevice, TentativeDeviceResponse } from "."
import {
  HTTPAccessPointResponse,
  AccessPointResponse,
  HTTPAccountResponse,
} from "../../_ic_api/identity_manager.d"
import { DeviceData } from "../../_ic_api/internet_identity.d"
import { ii, im } from "../../actors"
import { replaceIdentity } from "../../agent"
import { deviceInfo, getBrowserName, getIcon } from "../../device"
import { generateDelegationIdentity, registerIIAndIM } from "../../test-util"

describe("SignIn with Internet Identity", () => {
  jest.setTimeout(80000)

  it("should add tentative device to account.", async () => {
    const deviceName = "Device2"
    const identity: Ed25519KeyIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(identity)
    replaceIdentity(delegationIdentity)
    const anchor = await registerIIAndIM(identity)
    const identity2 = Ed25519KeyIdentity.generate()

    await ii.enter_device_registration_mode(anchor)

    const addedTentativelyDeviceResponse: TentativeDeviceResponse =
      await addTentativeDevice(identity2, deviceName, anchor)

    await ii.verify_tentative_device(
      anchor,
      addedTentativelyDeviceResponse.verificationCode,
    )

    await ii.exit_device_registration_mode(anchor)

    const accessPoints: HTTPAccessPointResponse = await im.create_access_point({
      icon: getIcon(deviceInfo),
      device: deviceName,
      browser: getBrowserName(),
      pub_key: identity2.getPrincipal().toString(),
    })

    expect(accessPoints.status_code).toEqual(200)
    expect(accessPoints.error).toStrictEqual([])
    const accessPoint: AccessPointResponse = accessPoints
      .data[0]?.[0] as AccessPointResponse
    expect(accessPoint.icon).toEqual("desktop")
    expect(accessPoint.device).toEqual("Device2")
    expect(accessPoint.browser).toEqual("Safari")
    expect(accessPoint.principal_id).toEqual(
      identity2.getPrincipal().toString(),
    )

    const deviceDatas: DeviceData[] = await ii.lookup(anchor)
    const lastDeviceData: DeviceData = deviceDatas[deviceDatas.length - 1]
    expect(lastDeviceData.alias).toEqual(deviceName)
    expect(lastDeviceData.protection).toEqual({ unprotected: null })
    expect(lastDeviceData.pubkey).toStrictEqual(
      new Uint8Array(identity2.getPublicKey().toDer()),
    )
    expect(lastDeviceData.key_type).toEqual({ platform: null })
    expect(lastDeviceData.purpose).toEqual({ authentication: null })
    expect(lastDeviceData.credential_id).toEqual([])

    const delegationIdentity2: DelegationIdentity =
      await generateDelegationIdentity(identity2)
    replaceIdentity(delegationIdentity2)

    const account: HTTPAccountResponse = await im.get_account()
    expect(account.data[0]?.anchor).toEqual(anchor)
  })
})
