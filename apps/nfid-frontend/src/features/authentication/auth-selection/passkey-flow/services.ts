import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationIdentity, WebAuthnIdentity } from "@dfinity/identity"
import * as decodeHelpers from "@simplewebauthn/server/helpers"
import { isoUint8Array } from "@simplewebauthn/server/helpers"
import base64url from "base64url"
import CBOR from "cbor"
import { toHexString } from "packages/integration/src/lib/lambda/ecdsa"
import { toast } from "react-toastify"

import {
  DeviceType,
  IClientDataObj,
  IPasskeyMetadata,
  Icon,
  LambdaPasskeyDecoded,
  RootWallet,
  authState,
  getPasskey,
  ii,
  im,
  requestFEDelegationChain,
  storePasskey,
} from "@nfid/integration"

import {
  createPasskeyAccessPoint,
  fetchProfile,
} from "frontend/integration/identity-manager"
import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
import { getBrowser } from "frontend/ui/utils"

export class PasskeyConnector {
  private async storePasskey({
    key,
    data,
  }: LambdaPasskeyDecoded): Promise<void> {
    const jsonData = JSON.stringify({
      ...data,
      credentialId: base64url.encode(Buffer.from(data.credentialId)),
      aaguid: base64url.encode(Buffer.from(data.aaguid)),
      publicKey: toHexString(data.publicKey),
    })

    const identity = WebAuthnIdentity.fromJSON(
      JSON.stringify({
        rawId: Buffer.from(data.credentialId).toString("hex"),
        publicKey: Buffer.from(data.publicKey).toString("hex"),
      }),
    )

    const profile = await fetchProfile()
    if (profile.wallet === RootWallet.II)
      ii.add(BigInt(profile.anchor), {
        credential_id: [Array.from(new Uint8Array(identity.rawId))],
        alias: "aaguid device name",
        pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
        key_type:
          data.type === "cross-platform"
            ? { cross_platform: null }
            : { platform: null },
        purpose: { authentication: null },
        protection: { unprotected: null },
      })

    await storePasskey(key, jsonData)
    await createPasskeyAccessPoint({
      browser: getBrowser(),
      device: "aaguid device name",
      deviceType: DeviceType.Passkey,
      icon: Icon.usb,
      principal: identity.getPrincipal().toText(),
      credential_id: [data.credentialStringId],
    })
  }

  async getPasskeyByCredentialID(key: string): Promise<IPasskeyMetadata> {
    const passkey = await getPasskey([key])
    const decodedObject = JSON.parse(passkey[0].data)

    return {
      ...decodedObject,
      credentialId: base64url.toBuffer(decodedObject.credentialId),
      aaguid: base64url.toBuffer(decodedObject.aaguid),
      publicKey: fromHexString(decodedObject.publicKey),
    }
  }

  async createCredential({ isMultiDevice }: { isMultiDevice: boolean }) {
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) throw new Error("Delegation identity not found")
    const { data: imDevices } = await im.read_access_points()
    if (!imDevices?.length) throw new Error("No devices found")
    const passkeys = imDevices[0].filter(
      (d) =>
        DeviceType.Passkey in d.device_type ||
        DeviceType.Unknown in d.device_type,
    )

    const allCredentials: string[] = passkeys
      .map((d) => d.credential_id.join(""))
      .filter((d) => d.length)

    const passkeysMetadata: IPasskeyMetadata[] = allCredentials.length
      ? await Promise.all(
          allCredentials.map(
            async (c) => await this.getPasskeyByCredentialID(c),
          ),
        )
      : []

    const email = (await fetchProfile()).email as string
    let credential: PublicKeyCredential
    try {
      credential = (await navigator.credentials.create({
        publicKey: {
          authenticatorSelection: {
            authenticatorAttachment: isMultiDevice
              ? "cross-platform"
              : "platform",
            userVerification: "preferred",
            residentKey: "required",
          },
          excludeCredentials: passkeysMetadata.map((p) => ({
            id: p.credentialId,
            type: "public-key",
          })),
          attestation: "direct",
          challenge: Buffer.from(JSON.stringify(delegationIdentity)),
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          rp: {
            name: "NFID",
            id: window.location.hostname,
          },
          user: {
            id: delegationIdentity.getPublicKey().toDer(), //take root id from the account
            name: email,
            displayName: email,
          },
        },
      })) as PublicKeyCredential
    } catch (e: any) {
      if (e.message.includes("registered")) {
        toast.error("This device is already registered")
      }
      return
    }

    const lambdaRequest = this.decodePublicKeyCredential(
      credential,
      isMultiDevice,
    )

    return await this.storePasskey(lambdaRequest)
  }

  async loginWithPasskey(signal?: AbortSignal, callback?: () => void) {
    const multiIdent = MultiWebAuthnIdentity.fromCredentials(
      [],
      false,
      "required",
      signal,
    )

    const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)

    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chain,
    )

    callback && callback()

    authState.set({
      identity: multiIdent._actualIdentity!,
      delegationIdentity,
      chain,
      sessionKey,
    })
  }

  async initPasskeyAutocomplete(signal?: AbortSignal) {
    const multiIdent = MultiWebAuthnIdentity.fromCredentials(
      [],
      false,
      "conditional",
      signal,
    )
    const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)

    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chain,
    )

    authState.set({
      identity: multiIdent._actualIdentity!,
      delegationIdentity,
      chain,
      sessionKey,
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
    const clientDataObj: IClientDataObj = JSON.parse(decodedClientData)

    const decodedAttestationObject = CBOR.decode(
      (credential.response as any).attestationObject,
    )
    const { authData } = decodedAttestationObject

    // includes flags, and all other data
    let authDataParsed = decodeHelpers.parseAuthenticatorData(authData)

    // Format the AAGUID as a UUID string
    const aaguid = isoUint8Array.toHex(authDataParsed.aaguid!)

    console.log({ aaguidString: aaguid, aaguidBuffer: authDataParsed.aaguid })

    const passkeyMetadata: IPasskeyMetadata = {
      name: "Some editable name or keychain title",
      type: isMultiDevice ? "cross-platform" : "platform",
      flags: {
        userPresent: authDataParsed.flags.up, // is user was present when signing the passkey
        userVerified: authDataParsed.flags.uv, // is user was verified when signing the passkey
        attestedCredentialDataIncluded: authDataParsed.flags.at, // unknown
        extensionDataIncluded: authDataParsed.flags.ed, // unknown
        backupEligibility: authDataParsed.flags.be, // is user key eligible for storing on iCloud, etc.
        backupState: authDataParsed.flags.bs, // is user key is backed up on iCloud, etc.
        flagsInt: authDataParsed.flags.flagsInt, // unknown
      },
      publicKey: authDataParsed.credentialPublicKey!,
      aaguid: authDataParsed.aaguid!,
      credentialId: credential.rawId,
      credentialStringId: credential.id,
      transports: (credential.response as any).getTransports(),
      clientData: clientDataObj,
      created_at: new Date().toISOString(),
    }

    const lambdaRequest = {
      key: credential.id,
      data: passkeyMetadata,
    }

    return lambdaRequest
  }
}

export const passkeyConnector = new PasskeyConnector()
