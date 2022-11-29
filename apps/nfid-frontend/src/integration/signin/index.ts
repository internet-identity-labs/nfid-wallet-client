import { DerEncodedPublicKey } from "@dfinity/agent"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"

import { authState, ii, requestFEDelegation } from "@nfid/integration"

import {
  AddTentativeDeviceResponse,
  DeviceData,
  Timestamp,
} from "../_ic_api/internet_identity.d"
import { fetchProfile } from "../identity-manager"
import { WebAuthnDevice } from "../identity-manager/devices/hooks"
import {
  Device,
  fetchAllDevices,
  getMultiIdent,
  lookup,
} from "../internet-identity"
import { derFromPubkey } from "../internet-identity/utils"

export type TentativeDeviceResponse = {
  verificationCode: string
  deviceRegistrationTimeout: Timestamp
}

type AddedTentatively = {
  added_tentatively: {
    verification_code: string
    device_registration_timeout: Timestamp
  }
}

export async function addTentativeDevice(
  publicKey: DerEncodedPublicKey,
  deviceName: string,
  anchor: bigint,
  credentialId?: ArrayBuffer,
): Promise<TentativeDeviceResponse> {
  const deviceData: DeviceData = {
    alias: deviceName,
    protection: {
      unprotected: null,
    },
    pubkey: Array.from(new Uint8Array(publicKey)),
    key_type: {
      platform: null,
    },
    purpose: {
      authentication: null,
    },
    credential_id: credentialId
      ? [Array.from(new Uint8Array(credentialId))]
      : [],
  }

  const addTentativeDeviceResponse: AddTentativeDeviceResponse =
    await ii.add_tentative_device(anchor, deviceData)

  if ("device_registration_mode_off" in addTentativeDeviceResponse) {
    throw Error("Device registration mode is off.")
  }

  if ("another_device_tentatively_added" in addTentativeDeviceResponse) {
    throw Error("Another device tentatively added.")
  }

  if (!("added_tentatively" in addTentativeDeviceResponse)) {
    throw Error("Unknown error during proccess of adding tentative device.")
  }

  const response = (addTentativeDeviceResponse as AddedTentatively)
    .added_tentatively

  return {
    verificationCode: response.verification_code,
    deviceRegistrationTimeout: response.device_registration_timeout,
  }
}

/**
 * Create an auth session from a tentative device
 * @param anchor user number
 * @param userDevice WebAuthnDevice
 * @returns II auth session
 */
export async function validateTentativeDevice(
  anchor: number,
  userDevice?: WebAuthnDevice,
) {
  const devices = await fetchAllDevices(BigInt(anchor))
  const addedDevice = devices.find((device) => {
    const devicePublicKey = toHexString(
      derFromPubkey(Array.from(new Uint8Array(device.pubkey))),
    )
    return devicePublicKey === userDevice?.publicKey
  })

  if (!addedDevice) return false

  const predicate: ((x: Device) => boolean) | undefined = false
    ? undefined
    : (x) => x.purpose === "authentication"

  try {
    let iiDevices = await lookup(Number(anchor), predicate)

    const multiIdentity = getMultiIdent(iiDevices, false)
    const FEDelegation = await requestFEDelegation(multiIdentity)

    console.log({ FEDelegation })

    authState.set(
      // @ts-ignore
      FEDelegation.delegationIdentity._inner,
      FEDelegation.delegationIdentity,
      ii,
    )

    const profile = await fetchProfile()
    console.log({ profile })
    //    im.use_access_point([getBrowserName()]).catch((error) => {
    //      throw new Error(
    //        `getIIAuthSession im.use_access_point: ${error.message}`,
    //      )
    //    })
    //  } catch (fetchProfileError: any) {
    //    if (fetchProfileError.code !== 404) {
    //      throw fetchProfileError
    //    }
    //  }
    // const accessPoint = {
    //   icon: getIcon(deviceInfo),
    //   device: deviceInfo.newDeviceName,
    //   browser: deviceInfo.browser.name ?? "Mobile",
    //   pub_key: Principal.selfAuthenticating(
    //     new Uint8Array(addedDevice.pubkey),
    //   ).toText(),
    // }
    // const loginResult = fromWebauthnDevices(
    //   BigInt(anchor),
    //   iiDevices,
    //   false,
    //   accessPoint,
    // )

    //   const res = await login(BigInt(anchor), false, accessPoint)
    //   console.log({ res })
    //   if (res.kind !== "loginSuccess") return false
    //   const reconstructedIdentity = reconstructIdentity({
    //     chain: res.chain,
    //     sessionKey: res.sessionKey,
    //   })
    //   return {
    //     sessionSource: "ii",
    //     anchor: anchor,
    //     identity: res.sessionKey,
    //     delegationIdentity: reconstructedIdentity,
    //   } as IIAuthSession
  } catch (e) {
    console.log({ e })
    return false
  }
}
