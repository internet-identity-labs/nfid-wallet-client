import { DerEncodedPublicKey } from "@dfinity/agent"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"

import {
  authState,
  DeviceType,
  FrontendDelegation,
  Icon,
  ii,
  replaceIdentity,
  setProfileToStorage,
} from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import {
  AddTentativeDeviceResponse,
  DeviceData,
  Timestamp,
} from "../_ic_api/internet_identity.d"
import { deviceInfo, getBrowserName } from "../device"
import {
  fetchProfile,
  registerProfileWithAccessPoint,
} from "../identity-manager"
import { fetchAllDevices } from "../internet-identity"
import { derFromPubkey } from "../internet-identity/utils"

export type TentativeDeviceResponse = {
  verificationCode: string
  deviceRegistrationTimeout: Timestamp
}

interface IIAuthenticationMachineContext {
  anchor: number
  appMeta?: AuthorizingAppMeta
  authSession: AuthSession
  isRegistered?: boolean
  verificationCode?: string
  userIdentity?: WebAuthnIdentity
  frontendDelegation?: FrontendDelegation
  loading?: boolean
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
 * @param userIdentity WebAuthnIdentity
 * @returns II auth session
 */
export async function createTentativeDevice({
  userIdentity,
  frontendDelegation: userDelegation,
  anchor,
}: IIAuthenticationMachineContext) {
  const session = {
    sessionSource: "localDevice",
    identity: userIdentity,
    delegationIdentity: userDelegation?.delegationIdentity,
    anchor,
  } as AuthSession

  if (!userIdentity || !userDelegation) return session

  replaceIdentity(userDelegation.delegationIdentity)

  await authState.set({
    identity: userIdentity,
    delegationIdentity: userDelegation.delegationIdentity,
    chain: userDelegation.chain,
    sessionKey: userDelegation.sessionKey,
  })

  let profile
  try {
    profile = await fetchProfile()
    await setProfileToStorage(profile)
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }

    await registerProfileWithAccessPoint(anchor, {
      deviceType: DeviceType.Unknown,
      browser: getBrowserName(),
      device: deviceInfo.newDeviceName,
      icon: Icon.desktop,
      pubKey: Array.from(
        new Uint8Array(userIdentity.getPublicKey().toDer() ?? []),
      ),
    })
  }

  return session
}

/**
 * Machine service
 * Check if tentative device added to II
 * @returns authSession
 */
export async function checkTentativeDevice({
  userIdentity,
  frontendDelegation: userDelegation,
  anchor,
}: IIAuthenticationMachineContext) {
  return new Promise<boolean>((resolve, _reject) => {
    const intervalCheck = async () => {
      window.setTimeout(async () => {
        if (!userIdentity || !userDelegation) return false

        const devices = await fetchAllDevices(BigInt(anchor))
        const addedDevice = devices.find((device) => {
          const devicePublicKey = toHexString(
            derFromPubkey(Array.from(new Uint8Array(device.pubkey))),
          )

          return (
            devicePublicKey ===
            toHexString(userIdentity?.getPublicKey().toDer())
          )
        })

        if (addedDevice) resolve(true)
        else intervalCheck()
      }, 3000)
    }

    intervalCheck()
  })
}
