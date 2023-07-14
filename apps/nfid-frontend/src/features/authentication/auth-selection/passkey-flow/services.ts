import * as decodeHelpers from "@simplewebauthn/server/helpers"
import CBOR from "cbor"

import { authState } from "@nfid/integration"

interface IAllowedCredential extends PublicKeyCredentialDescriptor {}
interface IClientDataObj {
  challenge: string
  crossOrigin: boolean
  origin: string
  type: string // webauthn.create, etc.
}

const storageKey = "storedPasskeys"

export class PasskeyConnector {
  private storeCredential(credential: IAllowedCredential): boolean {
    const credentials = this.getAllowedCredentials()
    const newCredentials = [...credentials, credential]

    localStorage.setItem(storageKey, JSON.stringify(newCredentials))
    return true
  }

  getAllowedCredentials(): IAllowedCredential[] {
    const item = localStorage.getItem(storageKey)
    if (!item) return []

    return JSON.parse(item)
  }

  async createCredential({ isMultiDevice }: { isMultiDevice: boolean }) {
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) throw new Error("Delegation identity not found")

    const creds = (await navigator.credentials.create({
      publicKey: {
        authenticatorSelection: {
          authenticatorAttachment: isMultiDevice
            ? "cross-platform"
            : "platform",
          userVerification: "preferred",
          residentKey: "required",
        },
        excludeCredentials: [], // pass legacy passkeys here
        attestation: "direct",
        challenge: Buffer.from(JSON.stringify(delegationIdentity)),
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        rp: {
          name: "NFID",
          // id: "nfid.one"
        },
        user: {
          id: delegationIdentity.getPublicKey().toDer(), //take root id from the account
          name: "email@email.com",
          displayName: "displayemail@email.com",
        },
      },
    })) as PublicKeyCredential

    const { allowedCredential, passkeyMetadata } =
      this.decodePublicKeyCredential(creds, isMultiDevice)
    this.storeCredential(allowedCredential)

    console.log({
      passkeyMetadata,
      allowedCredentials: this.getAllowedCredentials(),
    })
  }

  private decodePublicKeyCredential(
    credential: PublicKeyCredential,
    isMultiDevice?: boolean,
  ) {
    const utf8Decoder = new TextDecoder("utf-8")
    const decodedClientData = utf8Decoder.decode(
      credential.response.clientDataJSON,
    )
    const clientDataObj: IClientDataObj = JSON.parse(decodedClientData) // not used anywhere yet.

    const decodedAttestationObject = CBOR.decode(
      (credential.response as any).attestationObject,
    )
    const { authData } = decodedAttestationObject

    // includes flags, and all other data
    let authDataParsed = decodeHelpers.parseAuthenticatorData(authData)

    // object to store in lambda
    const allowedCredential: IAllowedCredential = {
      id: authDataParsed.credentialID!,
      type: "public-key",
      transports: (credential.response as any).getTransports(),
    }

    // object to store in im
    const passkeyMetadata = {
      name: "Some editable name or keychain title",
      type: isMultiDevice ? "Multi-device passkey" : "Single-device passkey",
      flags: {
        userPresent: authDataParsed.flags.up, // is user was present when signing the passkey
        userVerified: authDataParsed.flags.uv, // is user was verified when signing the passkey
        attestedCredentialDataIncluded: authDataParsed.flags.at, // unknown
        extensionDataIncluded: authDataParsed.flags.ed, // unknown
        backupEligibility: authDataParsed.flags.be, // is user key eligible for storing on iCloud, etc.
        backupState: authDataParsed.flags.bs, // is user key is backed up on iCloud, etc.
        flagsInt: authDataParsed.flags.flagsInt, // unknown
      },
      aaguid: authDataParsed.aaguid,
      credentialId: authDataParsed.credentialID,
      transports: (credential.response as any).getTransports(),
      created_at: new Date().toISOString(),
    }

    return {
      passkeyMetadata,
      allowedCredential,
    }
  }
}

export const passkeyConnector = new PasskeyConnector()
