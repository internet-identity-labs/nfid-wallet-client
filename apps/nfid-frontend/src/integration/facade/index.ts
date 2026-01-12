import { Principal } from "@dfinity/principal"

import {
  PublicKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import {
  removeDevice,
  removeRecoveryDeviceII,
} from "frontend/integration/internet-identity"

export async function removeRecoveryDeviceFacade(
  userNumber: UserNumber,
  seedPhrase: string,
): Promise<void> {
  const pubKey = await removeRecoveryDeviceII(userNumber, seedPhrase)
  await removeAccessPoint(
    Principal.selfAuthenticating(new Uint8Array(pubKey)).toText(),
  )
}

export async function removeAccessPointFacade(
  userNumber: UserNumber,
  principal: string,
  pubkey: PublicKey,
  isLegacyUser: boolean,
): Promise<void> {
  if (isLegacyUser) await removeDevice(userNumber, pubkey)
  await removeAccessPoint(principal)
}
