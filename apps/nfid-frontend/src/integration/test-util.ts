import * as Agent from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1"

import { actor, ii, im, replaceActorIdentity } from "@nfid/integration"

import { HTTPAccountRequest } from "frontend/integration/_ic_api/identity_manager.d"
import {
  Challenge,
  ChallengeResult,
  DeviceData,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"

import { idlFactory as imIDL } from "./_ic_api/identity_manager"
import { _SERVICE as IdentityManager } from "./_ic_api/identity_manager.d"

const LAMBDA_IDENTITY = process.env.LAMBDA_IDENTITY

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
    name: [],
    challenge_attempt: [],
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

export function getLambdaActor(): Agent.ActorSubclass<IdentityManager> {
  let identity = getLambdaIdentity()
  const lambdaIm = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
  replaceActorIdentity(im, identity)
  return lambdaIm
}

export function getLambdaIdentity(): Secp256k1KeyIdentity {
  if (!LAMBDA_IDENTITY) {
    throw Error("No LAMBDA_IDENTITY provided.")
  }
  const secretKey = Agent.fromHex(LAMBDA_IDENTITY.trim())
  return Secp256k1KeyIdentity.fromSecretKey(secretKey)
}
