import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import {
  delegationIdentityFromSignedIdentity,
  fetchDelegate,
  generateDelegationIdentity,
  ii,
  im,
  Profile,
  replaceIdentity,
} from "@nfid/integration"

import { ThirdPartyAuthSession } from "frontend/state/authorization"

import {
  HTTPAccessPointResponse,
  AccessPointResponse,
  HTTPAccountResponse,
} from "../_ic_api/identity_manager.d"
import { DeviceData, UserNumber } from "../_ic_api/internet_identity.d"
import { deviceInfo, getBrowserName, getIcon } from "../device"
import { createDeviceFactory } from "../device/create-device-factory"
import { delegationChainFromDelegation } from "../identity/delegation-chain-from-delegation"
import { fetchProfile } from "../identity-manager"
import { registerIIAccount, registerIIAndIM } from "../test-util"

import { addTentativeDevice, TentativeDeviceResponse } from "."

describe.skip("SignIn with Internet Identity", () => {
  jest.setTimeout(150000)

  it("should add tentative device to account and authorize thru it.", async () => {
    const deviceName = "Device2"
    const identity: Ed25519KeyIdentity = Ed25519KeyIdentity.generate()
    const { delegationIdentity } = await generateDelegationIdentity(identity)
    replaceIdentity(delegationIdentity)
    await registerIIAndIM(identity)
    const profile: Profile = await fetchProfile()
    const anchor: bigint = BigInt(profile.anchor)

    const identity2 = Ed25519KeyIdentity.generate()

    await ii.enter_device_registration_mode(anchor)

    const addedTentativelyDeviceResponse: TentativeDeviceResponse =
      await addTentativeDevice(
        identity2.getPublicKey().toDer(),
        deviceName,
        anchor,
      )

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
      device_type: {
        Email: null,
      },
      credential_id: [],
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

    const { delegationIdentity: delegationIdentity2 } =
      await generateDelegationIdentity(identity2)
    replaceIdentity(delegationIdentity2)

    const account: HTTPAccountResponse = await im.get_account()
    expect(account.data[0]?.anchor).toEqual(anchor)
  })

  it("should add register new II for existing II and auth thru it.", async () => {
    // NOTE: This is scaffolding for the test,
    // for real user use case we can just login thru his existing II account.
    const privateIiIdentity: Ed25519KeyIdentity = Ed25519KeyIdentity.generate()
    const privateIideviceData: DeviceData = createDeviceFactory(
      "PrivateDevice",
      privateIiIdentity.getPublicKey(),
    )
    const { delegationIdentity: privateDelegationIdentity } =
      await generateDelegationIdentity(privateIiIdentity)
    replaceIdentity(privateDelegationIdentity)
    const privateAnchor: UserNumber = await registerIIAccount(
      privateIiIdentity,
      privateIideviceData,
    )

    // NOTE: to retrieve the delegation from existing II,
    // make use of `signinWithII` function.
    const privateDelegation: ThirdPartyAuthSession = await fetchDelegate(
      Number(privateAnchor),
      "nfid.one",
      Array.from(new Uint8Array(privateIiIdentity.getPublicKey().toDer())),
    )

    const derivedDelegationIdentity: DelegationIdentity =
      delegationIdentityFromSignedIdentity(
        privateIiIdentity,
        delegationChainFromDelegation(privateDelegation),
      )

    replaceIdentity(derivedDelegationIdentity)

    const derivedDeviceData: DeviceData = createDeviceFactory(
      "DerivedDevice",
      derivedDelegationIdentity.getPublicKey(),
    )

    const derivedAnchor: UserNumber = await registerIIAccount(
      undefined as any as Ed25519KeyIdentity,
      derivedDeviceData,
    )

    await im.create_account({
      anchor: derivedAnchor,
      access_point: [],
      wallet: [],
      email: [],
      name: [],
      challenge_attempt: [],
    })

    // NOTE: Here I relogin to user's own II to check
    // I can obtain the same derived NFID profile from it.
    const { delegationIdentity: secondlyTakenPrivateDelegationIdentity } =
      await generateDelegationIdentity(privateIiIdentity)
    replaceIdentity(secondlyTakenPrivateDelegationIdentity)

    const secondlyTakenPrivateDelegation: ThirdPartyAuthSession =
      await fetchDelegate(
        Number(privateAnchor),
        "nfid.one",
        Array.from(
          new Uint8Array(
            secondlyTakenPrivateDelegationIdentity.getPublicKey().toDer(),
          ),
        ),
      )

    const secondlyTakenDerivedDelegationIdentity: DelegationIdentity =
      delegationIdentityFromSignedIdentity(
        privateIiIdentity,
        delegationChainFromDelegation(secondlyTakenPrivateDelegation),
      )

    replaceIdentity(secondlyTakenDerivedDelegationIdentity)
    const profile: Profile = await fetchProfile()
    expect(derivedAnchor).toEqual(BigInt(profile.anchor))
  })
})
