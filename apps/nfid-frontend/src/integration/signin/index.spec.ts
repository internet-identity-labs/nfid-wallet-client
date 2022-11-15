import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { ii, im } from "@nfid/integration"
import { replaceIdentity } from "@nfid/integration"

import { addTentativeDevice, TentativeDeviceResponse } from "."
import {
  HTTPAccessPointResponse,
  AccessPointResponse,
  HTTPAccountResponse,
} from "../_ic_api/identity_manager.d"
import { DeviceData } from "../_ic_api/internet_identity.d"
import { deviceInfo, getBrowserName, getIcon } from "../device"
import { fetchProfile, Profile } from "../identity-manager"
import { generateDelegationIdentity, registerIIAndIM } from "../test-util"

describe("SignIn with Internet Identity", () => {
  jest.setTimeout(100000)

  it("should add tentative device to account and authorize thru it.", async () => {
    const deviceName = "Device2"
    const identity: Ed25519KeyIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(identity)
    replaceIdentity(delegationIdentity)
    await registerIIAndIM(identity)
    const profile: Profile = await fetchProfile()
    const anchor: bigint = BigInt(profile.anchor)

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

    expect(accessPoints).toEqual(
      expect.objectContaining({
        status_code: 200,
        error: [],
      }),
    )

    const accessPoint: AccessPointResponse = accessPoints
      .data[0]?.[0] as AccessPointResponse

    expect(accessPoint).toEqual(
      expect.objectContaining({
        icon: "desktop",
        device: "Device2",
        browser: "Safari",
        principal_id: identity2.getPrincipal().toString(),
      }),
    )

    const deviceDatas: DeviceData[] = await ii.lookup(anchor)
    const lastDeviceData: DeviceData = deviceDatas[deviceDatas.length - 1]
    expect(lastDeviceData).toEqual({
      alias: deviceName,
      protection: { unprotected: null },
      pubkey: new Uint8Array(identity2.getPublicKey().toDer()),
      key_type: { platform: null },
      purpose: { authentication: null },
      credential_id: [],
    })

    const delegationIdentity2: DelegationIdentity =
      await generateDelegationIdentity(identity2)
    replaceIdentity(delegationIdentity2)

    const account: HTTPAccountResponse = await im.get_account()
    expect(account.data[0]?.anchor).toEqual(anchor)
  })
})
