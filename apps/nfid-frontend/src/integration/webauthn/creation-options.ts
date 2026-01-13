import { Buffer } from "buffer"

import { DerEncodedPublicKey } from "@dfinity/agent"

import * as tweetnacl from "tweetnacl"

import { CredentialId, DeviceData } from "../_ic_api/internet_identity.d"
import { Device } from "../internet-identity"
import { derFromPubkey } from "../internet-identity/utils"

interface DeviceWithCredential extends DeviceData {
  credential_id: [CredentialId]
}

/**
 * type predicate to type safe filtering for valid excludable credentials
 *
 * @param device fetched from II
 */
const isDeviceWithCredentialId = (device: {
  credential_id: [] | [CredentialId]
}): device is DeviceWithCredential =>
  !!device.credential_id[0] && Object.keys(device.credential_id[0]).length > 0

interface ExcludeCredential {
  id: Uint8Array
  type: "public-key"
}

/**
 * transforms II devices into exclude credentials array
 *
 * @param devices fetched from II
 */
export const transformDeviceDataToExcludeCredentials = (
  devices: DeviceData[],
): ExcludeCredential[] => {
  const devicesWithCredentialId = devices.filter(isDeviceWithCredentialId)
  return devicesWithCredentialId.map((d) => ({
    id: new Uint8Array(d.credential_id[0]),
    type: "public-key",
  }))
}

type Credentials = {
  pubkey: DerEncodedPublicKey
  credentialId: Buffer
}

export function getCredentials(devices: Device[]): Credentials[] {
  return devices
    .filter(
      (device): device is Device & { credentialId: CredentialId } =>
        !!device.credentialId && device.credentialId.length > 0,
    )
    .map((device) => {
      return {
        pubkey: derFromPubkey(device.pubkey),
        credentialId: Buffer.from(device.credentialId),
      }
    })
}

// The options sent to the browser when creating the credentials.
// Credentials (key pair) creation is signed with a private key that is unique per device
// model, as an "attestation" that the credentials were created with a FIDO
// device. In II we discard this attestation because we only care about the key
// pair that was created and that we use later. Discarding the attestation
// means we do not have to care about attestation checking security concerns
// like setting a server-generated, random challenge.
//
// Algorithm -7, ECDSA_WITH_SHA256, is specified. The reason is that the
// generated (ECDSA) key pair is used later directly to sign messages to the
// IC -- the "assertion" -- so we must use a signing algorithm supported by the
// IC:
//  * https://smartcontracts.org/docs/interface-spec/index.html#signatures
//
// For more information on attestation vs assertion (credentials.create vs
// credentials.get), see
//  * https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion
export const creationOptions = (
  devices: DeviceData[] = [],
  authenticatorAttachment: AuthenticatorAttachment = "platform",
): PublicKeyCredentialCreationOptions => {
  console.debug("creationOptions", {
    devices,
    IS_E2E_TEST,
    authenticatorAttachment,
  })
  return {
    authenticatorSelection: {
      userVerification: "preferred",
      ...(IS_E2E_TEST === "true" ? {} : { authenticatorAttachment }),
    },
    excludeCredentials: transformDeviceDataToExcludeCredentials(devices),
    challenge: window.crypto.getRandomValues(new Uint8Array(16)),
    pubKeyCredParams: [
      {
        type: "public-key",
        // alg: PubKeyCoseAlgo.ECDSA_WITH_SHA256
        alg: -7,
      },
      {
        type: "public-key",
        // alg: PubKeyCoseAlgo.RSA_WITH_SHA256
        alg: -257,
      },
    ],
    rp: {
      name: "Internet Identity Service",
    },
    user: {
      id: tweetnacl.randomBytes(16),
      name: "Internet Identity",
      displayName: "Internet Identity",
    },
  }
}
