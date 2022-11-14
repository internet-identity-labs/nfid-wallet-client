import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { HTTPAccountRequest } from "./_ic_api/identity_manager.d"
import {
  Challenge,
  ChallengeResult,
  DeviceData,
  UserNumber,
} from "./_ic_api/internet_identity.d"
import { ii, im } from "./actors"

export async function generateDelegationIdentity(identity: Ed25519KeyIdentity) {
  const sessionKey = Ed25519KeyIdentity.generate()
  const chain = await DelegationChain.create(
    identity,
    sessionKey.getPublicKey(),
    new Date(Date.now() + 3_600_000 * 44),
    {},
  )
  return DelegationIdentity.fromDelegation(sessionKey, chain)
}

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

export async function registerIIAndIM(
  identity: Ed25519KeyIdentity,
): Promise<bigint> {
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
  const anchor: UserNumber = await registerIIAccount(identity, deviceData)
  const req: HTTPAccountRequest = {
    anchor: anchor,
  }
  await im.create_account(req)
  return anchor
}
