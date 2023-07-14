import { ic } from "@nfid/integration"

export async function storePasskey(key: string, data: string) {
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
  aaguid: Uint8Array
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
