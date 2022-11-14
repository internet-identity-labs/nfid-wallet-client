import { Ed25519KeyIdentity } from "@dfinity/identity"

import {
  AddTentativeDeviceResponse,
  CredentialId,
  DeviceData,
  Timestamp,
} from "../../_ic_api/internet_identity.d"
import { ii } from "../../actors"

export type TentativeDeviceResponse = {
  verificationCode: string
  deviceRegistrationTimeout: Timestamp
}

export async function addTentativeDevice(
  identity: Ed25519KeyIdentity,
  deviceName: string,
  anchor: bigint,
  credentialId?: CredentialId,
): Promise<TentativeDeviceResponse> {
  const deviceData: DeviceData = {
    alias: deviceName,
    protection: {
      unprotected: null,
    },
    pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
    key_type: {
      platform: null,
    },
    purpose: {
      authentication: null,
    },
    credential_id: credentialId ? [credentialId] : [],
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

  type AddedTentatively = {
    added_tentatively: {
      verification_code: string
      device_registration_timeout: Timestamp
    }
  }

  const response = (addTentativeDeviceResponse as AddedTentatively)
    .added_tentatively

  return {
    verificationCode: response.verification_code,
    deviceRegistrationTimeout: response.device_registration_timeout,
  }
}
