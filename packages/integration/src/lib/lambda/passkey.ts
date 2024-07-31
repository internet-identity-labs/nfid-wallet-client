import { Actor, HttpAgent } from "@dfinity/agent"
import { Ed25519KeyIdentity } from "@dfinity/identity"

import { HTTPAccountResponse } from "../_ic_api/identity_manager.d"
import { idlFactory as passkeyIDL } from "../_ic_api/passkey_storage"
import { im, passkeyStorage } from "../actors"
import { ic } from "../agent"
import { ANCHOR_TO_GET_DELEGATION_FROM_DF } from "./ecdsa"

export async function storePasskey(key: string, data: string) {
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  if (anchor && anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF) {
    return await passkeyStorage.store_passkey(key, data)
  }
  const passkeyURL = ic.isLocal ? `/passkey` : AWS_PASSKEY
  return await fetch(passkeyURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      data,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
  })
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
  const lambdaPasskeyEncoded: LambdaPasskeyEncoded[] = (await actorPasskey[
    "get_passkey"
  ](keys)) as LambdaPasskeyEncoded[]
  if (lambdaPasskeyEncoded.length > 0) {
    return lambdaPasskeyEncoded
  }
  const passkeyURL = ic.isLocal ? `/passkey` : AWS_PASSKEY
  const params = new URLSearchParams()
  keys.forEach((key) => {
    params.append("keys", key)
  })
  const queryString = params.toString()
  return await fetch(`${passkeyURL}?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  })
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
