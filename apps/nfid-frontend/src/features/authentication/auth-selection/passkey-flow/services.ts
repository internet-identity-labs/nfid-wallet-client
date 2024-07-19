import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DER_COSE_OID,
  DelegationIdentity,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
  wrapDER,
} from "@dfinity/identity"
import * as decodeHelpers from "@simplewebauthn/server/helpers"
import { isoUint8Array } from "@simplewebauthn/server/helpers"
import base64url from "base64url"
import CBOR from "cbor"
import {
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
  authStorage,
} from "packages/integration/src/lib/authentication/storage"
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
  authenticationTracking,
  getPasskey,
  ii,
  im,
  requestFEDelegationChain,
  securityTracking,
  storePasskey,
} from "@nfid/integration"

import {
  getIsMobileDeviceMatch,
  getPlatformInfo,
} from "frontend/integration/device"
import {
  createPasskeyAccessPoint,
  fetchProfile,
} from "frontend/integration/identity-manager"
import {
  CredentialData,
  MultiWebAuthnIdentity,
} from "frontend/integration/identity/multiWebAuthnIdentity"
import { AbstractAuthSession } from "frontend/state/authentication"
import { getBrowser } from "frontend/ui/utils"

const alreadyRegisteredDeviceErrors = [
  "credentials already registered", //Chrome-based browsers
  "object that is not, or is no longer, usable", //Firefox
]

export class PasskeyConnector {
  private async storePasskey({
    key,
    data,
  }: LambdaPasskeyDecoded): Promise<void> {
    const jsonData = JSON.stringify({
      ...data,
      credentialId: base64url.encode(Buffer.from(data.credentialId)),
      publicKey: toHexString(data.publicKey),
    })

    const identity = WebAuthnIdentity.fromJSON(
      JSON.stringify({
        rawId: Buffer.from(data.credentialId).toString("hex"),
        publicKey: Buffer.from(data.publicKey).toString("hex"),
      }),
    )

    const profile = await fetchProfile()
    if (profile.wallet === RootWallet.II) {
      await ii.add(BigInt(profile.anchor), {
        credential_id: [Array.from(new Uint8Array(identity.rawId))],
        alias: `${getBrowser()} on ${getPlatformInfo().device}`,
        pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
        key_type:
          data.type === "cross-platform"
            ? { cross_platform: null }
            : { platform: null },
        purpose: { authentication: null },
        protection: { unprotected: null },
      })
    }

    const isSecurityKey =
      data.type === "cross-platform" &&
      !data.transports.includes("internal") &&
      !data.transports.includes("hybrid")

    await storePasskey(key, jsonData)
    await createPasskeyAccessPoint({
      browser: getBrowser(),
      device: isSecurityKey
        ? "Security Key"
        : data.type === "cross-platform" || data.transports.includes("hybrid")
        ? "Keychain"
        : `${getBrowser()} on ${getPlatformInfo().device}`,
      deviceType: DeviceType.Passkey,
      icon: isSecurityKey
        ? Icon.usb
        : getIsMobileDeviceMatch() || data.type === "cross-platform"
        ? Icon.mobile
        : Icon.desktop,
      principal: identity.getPrincipal().toText(),
      credential_id: [data.credentialStringId],
    })
  }

  async getPasskeyByCredentialID(key: string): Promise<IPasskeyMetadata> {
    const passkey = await getPasskey([key])
    const decodedObject = JSON.parse(passkey[0].data)
    console.debug("getPasskeyByCredentialID", { decodedObject })

    return {
      ...decodedObject,
      credentialId: base64url.toBuffer(decodedObject.credentialId),
      publicKey: fromHexString(decodedObject.publicKey),
    }
  }

  async createCredential({ isMultiDevice }: { isMultiDevice: boolean }) {
    const { delegationIdentity } = authState.get()
    const { data: imDevices } = await im.read_access_points()

    if (!delegationIdentity) throw new Error("Delegation identity not found")
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

    const profile = await fetchProfile()
    if (!profile) throw new Error("Profile not found")

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
            name: "NFID",
            id: window.location.hostname,
          },
          user: {
            id: Buffer.from(String(profile.anchor)),
            name: profile?.email ?? "",
            displayName: profile?.email ?? "",
          },
        },
      })) as PublicKeyCredential
    } catch (e: any) {
      console.error(e)
      if (alreadyRegisteredDeviceErrors.find((x) => e.message.includes(x))) {
        toast.error("This device is already registered")
      } else {
        toast.error(e.message)
      }
      securityTracking.addPasskeyError({ message: e.message })
      return
    }

    const lambdaRequest = this.decodePublicKeyCredential(credential)
    securityTracking.passkeyAdded({
      authenticatorAttachment: lambdaRequest.data.type,
      transports: lambdaRequest.data.transports,
      userPresent: lambdaRequest.data.flags.userPresent,
      userVerified: lambdaRequest.data.flags.userVerified,
      backupEligibility: lambdaRequest.data.flags.backupEligibility,
      backupState: lambdaRequest.data.flags.backupState,
      name: lambdaRequest.data.name,
    })

    return await this.storePasskey(lambdaRequest)
  }

  async loginWithPasskey(
    signal?: AbortSignal,
    callback?: () => void,
    allowedPasskeys: CredentialData[] = [],
  ) {
    const multiIdent = MultiWebAuthnIdentity.fromCredentials(
      allowedPasskeys,
      false,
      "optional",
      signal,
      true,
    )

    try {
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

      const profile = await fetchProfile()
      await im.use_access_point([])

      authenticationTracking.updateData({ isNewUser: false })
      authenticationTracking.completed({
        anchor: profile.anchor,
        legacyUser: profile.wallet === RootWallet.II,
        hasEmail: !!profile.email,
      })

      await this.cachePasskeyDelegation(sessionKey, delegationIdentity)

      return {
        anchor: profile.anchor,
        delegationIdentity: delegationIdentity,
        identity: multiIdent._actualIdentity!,
      }
    } catch (e: any) {
      toast.error(e.message)
      authState.reset(false)
      authenticationTracking.aborted({
        authSource: "passkey - continue",
      })
      throw e
    } finally {
      callback?.()
    }
  }

  async loginWithAllowedPasskey(
    allowedDevices?: string[],
  ): Promise<AbstractAuthSession> {
    let allowedPasskeys: string[] = allowedDevices ?? []

    if (!allowedPasskeys?.length) {
      const { data: imDevices } = await im.read_access_points()
      if (!imDevices?.length) throw new Error("No devices found")

      allowedPasskeys = imDevices[0]
        .filter(
          (d) =>
            DeviceType.Passkey in d.device_type && d.credential_id[0]?.length,
        )
        .map((d) => d.credential_id[0]) as string[]
    }

    const passkeysMetadata: IPasskeyMetadata[] = await Promise.all(
      allowedPasskeys.map(async (p) => await this.getPasskeyByCredentialID(p!)),
    )

    return await this.loginWithPasskey(
      undefined,
      undefined,
      passkeysMetadata.map((p) => ({
        credentialId: p.credentialId,
        pubkey: wrapDER(p.publicKey, DER_COSE_OID) as any,
      })),
    )
  }

  async initPasskeyAutocomplete(
    signal: AbortSignal,
    onBegin: () => void,
    onEnd: (data: AbstractAuthSession) => void,
  ) {
    try {
      authenticationTracking.initiated({
        authSource: "passkey - conditional",
      })
      const multiIdent = MultiWebAuthnIdentity.fromCredentials(
        [],
        false,
        "conditional",
        signal,
        true,
      )

      const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)
      onBegin()

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

      const profile = await fetchProfile()
      im.use_access_point([])

      authenticationTracking.updateData({
        isNewUser: false,
      })

      authenticationTracking.completed({
        anchor: profile.anchor,
        hasEmail: !!profile.email,
        legacyUser: profile.wallet === RootWallet.II,
      })

      const authSession = {
        anchor: profile.anchor,
        delegationIdentity: delegationIdentity,
        identity: multiIdent._actualIdentity!,
      }

      onEnd && onEnd(authSession)
    } catch (e) {
      console.debug(e)
    }
  }

  private decodePublicKeyCredential(credential: PublicKeyCredential) {
    console.debug("decodePublicKeyCredential", { credential })

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

    const passkeyMetadata: IPasskeyMetadata = {
      name: "Some editable name or keychain title",
      type: credential.authenticatorAttachment as "cross-platform" | "platform",
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
      aaguid,
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

  private async cachePasskeyDelegation(
    identity: Ed25519KeyIdentity,
    delegationIdentity: DelegationIdentity,
  ) {
    const keyIdentity = JSON.stringify(identity.toJSON())
    const delegation = JSON.stringify(
      delegationIdentity.getDelegation().toJSON(),
    )

    console.debug("PasskeyConnector.cachePasskeyDelegation", {
      keyIdentity,
      delegation,
    })

    await authStorage.set(KEY_STORAGE_KEY, keyIdentity)
    await authStorage.set(KEY_STORAGE_DELEGATION, delegation)
  }
}

export const passkeyConnector = new PasskeyConnector()
