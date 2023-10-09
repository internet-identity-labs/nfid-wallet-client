import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ii, im } from "@nfid/integration"

import { HTTPAccountRequest } from "frontend/integration/_ic_api/identity_manager.d"
import {
  Challenge,
  ChallengeResult,
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"

export async function registerIIAccount(
  // FIXME: unused
  identity: Ed25519KeyIdentity,
  deviceData: DeviceData,
) {
  const challenge: Challenge = (await ii.create_challenge()) as Challenge
  const challenageResult: ChallengeResult = {
    key: challenge.challenge_key,
    chars: "a",
  }
  const registerResponse = (await ii.register(
    deviceData,
    challenageResult,
  )) as { registered: { user_number: UserNumber } }
  return registerResponse.registered.user_number
}

export async function registerIIAndIM(identity: Ed25519KeyIdentity) {
  const deviceData: DeviceData = {
    alias: "Device",
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
    credential_id: [],
  }
  let anchor: UserNumber = await registerIIAccount(identity, deviceData)
  let req: HTTPAccountRequest = {
    anchor: anchor,
    access_point: [],
    wallet: [],
    email: [],
  }
  await im.create_account(req)
}

export const getIdentity = (seed: string): Ed25519KeyIdentity => {
  const seedEncoded: Uint8Array = new TextEncoder().encode(seed)
  return Ed25519KeyIdentity.generate(seedEncoded)
}

export const getDelegationIdentity = async (
  keyIdentity: Ed25519KeyIdentity,
): Promise<DelegationIdentity> => {
  const identityDevicesessionKey = Ed25519KeyIdentity.generate()
  const identityDeviceChain = await DelegationChain.create(
    keyIdentity,
    identityDevicesessionKey.getPublicKey(),
    new Date(Date.now() + 3_600_000 * 44),
    {},
  )
  const identityDeviceDelegationIdentity = DelegationIdentity.fromDelegation(
    identityDevicesessionKey,
    identityDeviceChain,
  )
  return identityDeviceDelegationIdentity
}
