import { Actor, HttpAgent } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"

import { HTTPAccountResponse } from "../_ic_api/identity_manager.d"
import { idlFactory as passkeyIDL } from "../_ic_api/passkey_storage"
import { im, passkeyStorage } from "../actors"
import { ic } from "../agent"

export async function storePasskey(key: string, data: string) {
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  return await passkeyStorage.store_passkey(key, data, anchor!)
}

export async function getPasskey(
  keys: string[],
): Promise<LambdaPasskeyEncoded[]> {
  //we know nothing about user on this stage
  const identity = Ed25519KeyIdentity.generate()
  const agent: HttpAgent = new HttpAgent({ host: "https://ic0.app", identity })
  const actorPasskey = Actor.createActor(passkeyIDL, {
    agent,
    canisterId: PASSKEY_STORAGE,
  })
  //try to get key from the canister
  const canisterPasskeyEncoded: LambdaPasskeyEncoded[] = (await actorPasskey[
    "get_passkey"
  ](keys)) as LambdaPasskeyEncoded[]
  //we are migration keys from lambda to canister
  //TODO finish migration
  const fromLambda = keys.filter((key) => {
    return !canisterPasskeyEncoded.find((k) => k.key === key)
  })
  if (fromLambda.length === 0) {
    return canisterPasskeyEncoded
  }
  const passkeyURL = ic.isLocal ? `/passkey` : AWS_PASSKEY
  const params = new URLSearchParams()
  fromLambda.forEach((key) => {
    params.append("keys", key)
  })
  const queryString = params.toString()
  const lambdaPasskeyEncoded: LambdaPasskeyEncoded[] = await fetch(
    `${passkeyURL}?${queryString}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  ).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  })
  return canisterPasskeyEncoded.concat(lambdaPasskeyEncoded)
}

export interface IClientDataObj {
  challenge: string
  crossOrigin: boolean
  origin: string
  type: string // webauthn.create, etc.
}

export interface IFlags {
  userPresent: boolean // is user was present when signing the passkey
  userVerified: boolean // is user was verified when signing the passkey
  attestedCredentialDataIncluded: boolean // if the attestation statement includes the attestedCredentialData
  extensionDataIncluded: boolean // if the authData includes extension data
  backupEligibility: boolean // is user key eligible for storing on iCloud, etc.
  backupState: boolean // is user key is backed up on iCloud, etc.
  flagsInt: number // a raw byte value that contains bit flags
}

export interface IPasskeyMetadata {
  name: string
  type: "cross-platform" | "platform"
  flags: IFlags
  aaguid: string
  credentialId: ArrayBuffer
  credentialStringId: string
  transports: AuthenticatorTransport[]
  clientData: IClientDataObj
  created_at: string
  publicKey: Uint8Array
}

export interface LambdaPasskeyDecoded {
  key: string
  data: IPasskeyMetadata
}

export interface LambdaPasskeyEncoded {
  key: string
  data: string
}
