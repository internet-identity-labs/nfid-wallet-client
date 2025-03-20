import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DelegationIdentity,
  DER_COSE_OID,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
  wrapDER,
} from "@dfinity/identity"
import { randomBytes } from "@noble/hashes/utils"
import * as decodeHelpers from "@simplewebauthn/server/helpers"
import { isoUint8Array } from "@simplewebauthn/server/helpers"
import base64url from "base64url"
import CBOR from "cbor"
import { Challenge } from "packages/integration/src/lib/_ic_api/identity_manager.d"
import {
  authStorage,
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
} from "packages/integration/src/lib/authentication/storage"
import { toHexString } from "packages/integration/src/lib/delegation-factory/delegation-i"
import { getIsMobileDeviceMatch } from "packages/ui/src/utils/is-mobile"

import { getBrowser } from "@nfid-frontend/utils"
import {
  AccessPoint,
  authState,
  DeviceType,
  generateDelegationIdentity,
  getPasskey,
  IClientDataObj,
  Icon,
  ii,
  im,
  IPasskeyMetadata,
  LambdaPasskeyDecoded,
  replaceActorIdentity,
  requestFEDelegationChain,
  RootWallet,
  storePasskey,
} from "@nfid/integration"

import { getPlatformInfo } from "frontend/integration/device"
import {
  createNFIDProfile,
  createPasskeyAccessPoint,
  fetchProfile,
} from "frontend/integration/identity-manager"
import {
  CredentialData,
  MultiWebAuthnIdentity,
} from "frontend/integration/identity/multiWebAuthnIdentity"
import { AbstractAuthSession } from "frontend/state/authentication"

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

    await storePasskey(key, jsonData)
    await createPasskeyAccessPoint({
      browser: getBrowser(),
      deviceType: DeviceType.Passkey,
      principal: identity.getPrincipal().toText(),
      credential_id: [data.credentialStringId],
      ...this.getAccessPointDeviceAndIcon(data),
    })
  }

  private getAccessPointDeviceAndIcon({ transports, type }: IPasskeyMetadata) {
    let icon
    let device

    if (
      transports.filter((item) =>
        ["usb", "nfc", "ble", "smart-card"].includes(item),
      )
    ) {
      icon = Icon.usb
      device = "Security key"
    } else if (
      transports.includes("hybrid") &&
      transports.includes("internal")
    ) {
      if (getPlatformInfo().os === "Android") {
        icon = getIsMobileDeviceMatch() ? Icon.mobile : Icon.desktop
        device = `${getBrowser()} on ${getPlatformInfo().device}`
      } else {
        icon = Icon.apple
        device = "iCloud keychain"
      }
    } else if (transports.includes("internal")) {
      icon = getIsMobileDeviceMatch() ? Icon.mobile : Icon.desktop
      device = `${getBrowser()} on ${getPlatformInfo().device}`
    } else {
      icon = Icon.passkey
      device = "Unknown passkey"
    }

    return {
      device,
      icon,
    }
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

  async getDevices() {
    const { data } = await im.read_access_points()

    if (!data?.length) throw new Error("No devices found")
    return data
  }

  async hasPasskeys(): Promise<boolean> {
    try {
      const devices = await this.getDevices()
      return devices[0].some(
        (d) =>
          DeviceType.Passkey in d.device_type ||
          DeviceType.Unknown in d.device_type,
      )
    } catch (e) {
      console.error("Passkey error: ", e)
      throw new Error((e as Error).message)
    }
  }

  async getCaptchaChallenge(): Promise<Challenge> {
    return await im.get_captcha()
  }

  async updateStorageCredentialsId(accessPoint: AccessPoint) {
    if (accessPoint.credentialId) {
      const newKey = accessPoint.credentialId
      let keys = await authStorage.get("credentialIds")
      const parsedKeys: string[] = keys ? JSON.parse(keys as string) : []
      if (!parsedKeys.includes(newKey)) {
        parsedKeys.push(newKey)
        await authStorage.set("credentialIds", JSON.stringify(parsedKeys))
      }
    }
  }

  async registerWithPasskey(
    name: string,
    challengeAttempt: {
      challengeKey: string
      chars?: string
    },
  ) {
    let credential: PublicKeyCredential
    const nextBorrowedAnchor = randomBytes(16)
    try {
      credential = await this.createNavigatorCredential(
        nextBorrowedAnchor,
        name,
      )
    } catch (e) {
      console.error(e)
      const errorMessage = (e as Error).message
      if (alreadyRegisteredDeviceErrors.find((x) => errorMessage.includes(x))) {
        throw new Error("This device is already registered.")
      } else {
        throw new Error(errorMessage)
      }
    }

    const { key, data } = this.decodePublicKeyCredential(credential)

    const tempKey = Ed25519KeyIdentity.generate()

    await replaceActorIdentity(im, tempKey)

    const identity = WebAuthnIdentity.fromJSON(
      JSON.stringify({
        rawId: Buffer.from(data.credentialId).toString("hex"),
        publicKey: Buffer.from(data.publicKey).toString("hex"),
      }),
    )

    const profile = await createNFIDProfile(
      {
        delegationIdentity: tempKey,
        name: name,
        deviceType: DeviceType.Passkey,
        credentialId: key,
        devicePrincipal: identity.getPrincipal().toText(),
        ...this.getAccessPointDeviceAndIcon(data),
      },
      challengeAttempt,
    )

    const jsonData = JSON.stringify({
      ...data,
      credentialId: base64url.encode(Buffer.from(data.credentialId)),
      publicKey: toHexString(data.publicKey),
      user: nextBorrowedAnchor,
    })

    await storePasskey(key, jsonData)

    const { delegationIdentity, sessionKey, chain } =
      await generateDelegationIdentity(tempKey)

    await this.updateStorageCredentialsId(profile.accessPoints[0])

    await this.setAuthState({
      identity,
      delegationIdentity,
      sessionKey,
      chain,
    })
    await this.cachePasskeyDelegation(sessionKey, delegationIdentity)

    return {
      anchor: profile.anchor,
      name: profile.name,
      delegationIdentity,
      identity: identity,
    }
  }

  private setAuthState(...toSet: Parameters<typeof authState.set>) {
    return authState.set(...toSet)
  }

  async createCredential() {
    const { delegationIdentity } = authState.get()
    const imDevices = await this.getDevices()

    if (!delegationIdentity) throw new Error("Delegation identity not found")

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
            name: profile?.email ?? profile.name ?? "",
            displayName: profile?.email ?? profile.name ?? "",
          },
        },
      })) as PublicKeyCredential
    } catch (e) {
      console.error(e)
      const errorMessage = (e as Error).message
      if (alreadyRegisteredDeviceErrors.find((x) => errorMessage.includes(x))) {
        throw new Error("This device is already registered.")
      } else {
        throw new Error(errorMessage)
      }
    }

    const lambdaRequest = this.decodePublicKeyCredential(credential)

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
      "required",
      signal,
      true,
    )

    try {
      const { sessionKey, chain } = await requestFEDelegationChain(multiIdent)

      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chain,
      )

      await authState.set({
        identity: multiIdent._actualIdentity!,
        delegationIdentity,
        chain,
        sessionKey,
      })

      const profile = await fetchProfile()

      const accessPoint = profile.accessPoints.find(
        (ap) => ap.credentialId === delegationIdentity.getPrincipal().toText(),
      )
      if (accessPoint) await this.updateStorageCredentialsId(accessPoint)
      im.use_access_point([])

      await this.cachePasskeyDelegation(sessionKey, delegationIdentity)

      return {
        anchor: profile.anchor,
        name: profile.name,
        delegationIdentity: delegationIdentity,
        identity: multiIdent._actualIdentity!,
      }
    } catch (e) {
      authState.reset()
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
      const imDevices = await this.getDevices()

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

  private decodePublicKeyCredential(credential: PublicKeyCredential): {
    key: string
    data: IPasskeyMetadata
  } {
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

    await authStorage.set(KEY_STORAGE_KEY, keyIdentity)
    await authStorage.set(KEY_STORAGE_DELEGATION, delegation)
  }

  private _createChallengeBuffer(
    challenge: string | Uint8Array = "<ic0.app>",
  ): Uint8Array {
    if (typeof challenge === "string") {
      return Uint8Array.from(challenge, (c) => c.charCodeAt(0))
    } else {
      return challenge
    }
  }

  private async createNavigatorCredential(
    nextBorrowedAnchor: BufferSource,
    name: string,
  ): Promise<PublicKeyCredential> {
    return (await navigator.credentials.create({
      publicKey: {
        attestation: "direct",
        challenge: this._createChallengeBuffer(),
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
          id: nextBorrowedAnchor,
          name: name,
          displayName: name,
        },
      },
    })) as PublicKeyCredential
  }
}

export const passkeyConnector = new PasskeyConnector()
