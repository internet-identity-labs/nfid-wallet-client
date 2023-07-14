import { Principal } from "@dfinity/principal"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import {
  fetchAllDevices,
  removeDevice,
  removeRecoveryDeviceII,
} from "frontend/integration/internet-identity"

export async function removeRecoveryDeviceFacade(
  userNumber: UserNumber,
  seedPhrase: string,
): Promise<void> {
  let pubKey = await removeRecoveryDeviceII(userNumber, seedPhrase)
  await removeAccessPoint(
    Principal.selfAuthenticating(new Uint8Array(pubKey)).toText(),
  )
}

export async function removeAccessPointFacade(
  userNumber: UserNumber,
  principal: string,
): Promise<void> {
  const iiDevices = await fetchAllDevices(userNumber)
  const iiDevice = iiDevices.find(
    (d) =>
      Principal.selfAuthenticating(new Uint8Array(d.pubkey)).toText() ===
      principal,
  )
  await removeDevice(userNumber, iiDevice?.pubkey as DeviceKey)

  await removeAccessPoint(principal)
}
