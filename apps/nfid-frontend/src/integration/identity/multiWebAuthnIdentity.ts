/**
 * This module provides an identity that is a bit like `WebAuthnIdentity`, but
 *
 * - You can create it from a _list_ of public keys/credential ids
 * - Upon signing, it will let the device sign with any of the given keys/credential ids.
 * - You need to use it to sign a message before you can use `getPublicKey`, because only
 *   then we know which one the user is actually using
 * - It doesn't support creating credentials; use `WebAuthnIdentity` for that
 */
import {
  DerEncodedPublicKey,
  PublicKey,
  Signature,
  SignIdentity,
} from "@dfinity/agent"
import { DER_COSE_OID, unwrapDER, WebAuthnIdentity } from "@dfinity/identity"
import borc from "borc"
import { Buffer } from "buffer"
import { authStorage } from "packages/integration/src/lib/authentication/storage"
import toaster from "packages/ui/src/atoms/toast"
import { arrayBufferEqual } from "src/integration/identity/services"

import { IPasskeyMetadata } from "@nfid/integration"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"

export type CredentialId = ArrayBuffer
export type CredentialData = {
  pubkey: DerEncodedPublicKey
  credentialId: CredentialId
}

/**
 * A SignIdentity that uses `navigator.credentials`. See https://webauthn.guide/ for
 * more information about WebAuthentication.
 */
export class MultiWebAuthnIdentity extends SignIdentity {
  public static fromCredentials(
    credentialData: CredentialData[],
    withSecurityDevices?: boolean,
    mediation?: CredentialMediationRequirement,
    signal?: AbortSignal,
    isNewDevice?: boolean,
  ): MultiWebAuthnIdentity {
    const instance = new this(
      credentialData,
      withSecurityDevices,
      mediation,
      signal,
      isNewDevice,
    )
    instance.restoreIdentity()
    return instance
  }

  private operationIsActive: boolean = true
  public _actualIdentity?: WebAuthnIdentity
  public _withSecurityDevices?: boolean
  public _mediation?: CredentialMediationRequirement
  public _signal?: AbortSignal
  public _isNewDevice?: boolean

  protected constructor(
    readonly credentialData: CredentialData[],
    withSecurityDevices?: boolean,
    mediation?: CredentialMediationRequirement,
    signal?: AbortSignal,
    isNewDevice?: boolean,
  ) {
    super()
    this._actualIdentity = undefined
    this._withSecurityDevices = withSecurityDevices
    this._mediation = mediation
    this._signal = signal
    this._isNewDevice = isNewDevice

    window.addEventListener("beforeunload", () => this.saveIdentity())
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.restoreIdentity()
      }
    })
  }

  private async saveIdentity(): Promise<void> {
    if (this._actualIdentity) {
      await authStorage.set(
        "actualIdentity",
        JSON.stringify(this._actualIdentity.toJSON()),
      )
    }
  }

  private async restoreIdentity(): Promise<void> {
    const savedIdentity = await authStorage.get("actualIdentity")
    if (savedIdentity) {
      this._actualIdentity = WebAuthnIdentity.fromJSON(savedIdentity as string)
    }
  }

  public getPublicKey(): PublicKey {
    if (this._actualIdentity === undefined) {
      throw new Error("cannot use getPublicKey() before a successful sign()")
    } else {
      return this._actualIdentity.getPublicKey()
    }
  }

  public async sign(blob: ArrayBuffer): Promise<Signature> {
    const transports: AuthenticatorTransport[] = this._withSecurityDevices
      ? ["usb", "nfc", "ble"]
      : []

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: blob,
      userVerification: "preferred",
    }

    if (this.credentialData.length > 0) {
      publicKeyOptions.allowCredentials = this.credentialData.map((cd) => ({
        type: "public-key",
        id: cd.credentialId,
        transports: [...transports],
      }))
    }

    const result = (await navigator.credentials.get({
      mediation: this._mediation,
      publicKey: publicKeyOptions,
      signal: this._signal,
    })) as PublicKeyCredential

    if (!this._isNewDevice) {
      this.credentialData.forEach((cd) => {
        if (arrayBufferEqual(cd.credentialId, Buffer.from(result.rawId))) {
          const strippedKey = unwrapDER(cd.pubkey, DER_COSE_OID)

          const id = WebAuthnIdentity.fromJSON(
            JSON.stringify({
              rawId: Buffer.from(cd.credentialId).toString("hex"),
              publicKey: Buffer.from(strippedKey).toString("hex"),
            }),
          )
          this._actualIdentity = id
        }
      })
    } else {
      let passkeyMetadata: IPasskeyMetadata

      try {
        passkeyMetadata = await passkeyConnector.getPasskeyByCredentialID(
          result.id,
        )
      } catch (e) {
        console.error(e)
        toaster.error("We could not find your Passkey. Try different one")
        throw new Error("We could not find your Passkey.")
      }

      this._actualIdentity = WebAuthnIdentity.fromJSON(
        JSON.stringify({
          rawId: Buffer.from(passkeyMetadata.credentialId).toString("hex"),
          publicKey: Buffer.from(passkeyMetadata.publicKey).toString("hex"),
        }),
      )
    }

    if (this._actualIdentity === undefined) {
      throw new Error("Internal error: could not recover identity")
    }

    const response = result.response as AuthenticatorAssertionResponse
    const cbor = borc.encode(
      new borc.Tagged(55799, {
        authenticator_data: new Uint8Array(response.authenticatorData),
        client_data_json: new TextDecoder().decode(response.clientDataJSON),
        signature: new Uint8Array(response.signature),
      }),
    )

    if (!cbor) {
      throw new Error("failed to encode cbor")
    }

    if (!this.operationIsActive) {
      throw new Error("Operation was cancelled")
    }

    return new Uint8Array(cbor).buffer as Signature
  }
}
