import { DerEncodedPublicKey } from "@dfinity/agent"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { WebAuthnIdentity } from "@dfinity/identity"

import {
  authState,
  FrontendDelegation,
  ii,
  replaceIdentity,
  setProfile,
} from "@nfid/integration"

import { IIAuthenticationMachineContext } from "frontend/features/sign-in-options/machine"
import { AuthSession } from "frontend/state/authentication"

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
export async function validateTentativeDevice(
  anchor: number,
  userIdentity?: WebAuthnIdentity,
  userDelegation?: FrontendDelegation,
) {
  if (!userIdentity || !userDelegation) return false

  const devices = await fetchAllDevices(BigInt(anchor))
  const addedDevice = devices.find((device) => {
    const devicePublicKey = toHexString(
      derFromPubkey(Array.from(new Uint8Array(device.pubkey))),
    )

    return devicePublicKey === toHexString(userIdentity?.getPublicKey().toDer())
  })

  if (!addedDevice) return false

  replaceIdentity(userDelegation.delegationIdentity)

  authState.set(
    userIdentity,
    userDelegation.delegationIdentity,
    ii,
    userDelegation.chain,
    userDelegation.sessionKey,
  )

  let profile
  try {
    profile = await fetchProfile()
    setProfile(profile)
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }

    await registerProfileWithAccessPoint(anchor, {
      browser: getBrowserName(),
      device: deviceInfo.newDeviceName,
      icon: "desktop",
      pubKey: Array.from(
        new Uint8Array(userIdentity.getPublicKey().toDer() ?? []),
      ),
    })
  }

  const session = {
    sessionSource: "localDevice",
    identity: userIdentity,
    delegationIdentity: userDelegation.delegationIdentity,
    anchor: anchor,
  } as AuthSession

  return session
}

/**
 * Machine service
 * Check if tentative device added to II
 * @returns authSession
 */
export async function checkTentativeDevice(
  context: IIAuthenticationMachineContext,
) {
  return new Promise<AuthSession>((resolve, reject) => {
    const intervalCheck = async () => {
      window.setTimeout(async function () {
        const result = await validateTentativeDevice(
          context.anchor,
          context.userIdentity,
          context.frontendDelegation,
        )

        if (result) resolve(result)
        else intervalCheck()
      }, 3000)
    }

    intervalCheck()
  })
}
