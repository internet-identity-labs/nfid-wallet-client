import { Signature, SignIdentity } from "@icp-sdk/core/agent"
import { DelegationIdentity, WebAuthnIdentity } from "@icp-sdk/core/identity"
import base64url from "base64url"
import borc from "borc"
import { Buffer } from "buffer"

import { AccessPointResponse } from "../_ic_api/identity_manager.d"
import { PasskeyNotConfirmedError } from "../delete-account/error/passkey-not-confirmed.error"
import { getPasskey } from "../lambda/passkey"
import { hasOwnProperty } from "../test-utils"
import { authState } from "./auth-state"
import { requestFEDelegationChain } from "./frontend-delegation"

type PasskeyCredential = {
  credentialId: Buffer
  publicKey: Buffer
  credentialStringId: string
}

export class PasskeySignIdentity extends SignIdentity {
  public resolvedIdentity?: WebAuthnIdentity

  constructor(private readonly credentials: PasskeyCredential[]) {
    super()
  }

  getPublicKey() {
    if (!this.resolvedIdentity)
      throw new Error("cannot use getPublicKey() before sign()")
    return this.resolvedIdentity.getPublicKey()
  }

  async sign(blob: Uint8Array): Promise<Signature> {
    const result = (await navigator.credentials.get({
      mediation: "required",
      publicKey: {
        challenge: blob.buffer as ArrayBuffer,
        allowCredentials: this.credentials.map((credential) => ({
          type: "public-key" as const,
          id: credential.credentialId.buffer as ArrayBuffer,
          transports: [] as AuthenticatorTransport[],
        })),
        userVerification: "preferred",
      },
    })) as PublicKeyCredential

    const matched = this.credentials.find(
      (credential) => credential.credentialStringId === result.id,
    )
    if (!matched) throw new PasskeyNotConfirmedError("Passkey mismatch")

    this.resolvedIdentity = WebAuthnIdentity.fromJSON(
      JSON.stringify({
        rawId: matched.credentialId.toString("hex"),
        publicKey: matched.publicKey.toString("hex"),
      }),
    )

    const response = result.response as AuthenticatorAssertionResponse
    const cbor = borc.encode(
      new borc.Tagged(55799, {
        authenticator_data: new Uint8Array(response.authenticatorData),
        client_data_json: new TextDecoder().decode(response.clientDataJSON),
        signature: new Uint8Array(response.signature),
      }),
    )

    if (!cbor) throw new Error("failed to encode cbor")

    return new Uint8Array(cbor).buffer as Signature
  }
}

export class ReauthenticationService {
  async reauthenticateWithPasskey(
    accessPoints: AccessPointResponse[],
  ): Promise<void> {
    const passkeyAccessPoints = accessPoints.filter((accessPoint) =>
      this.isNonLegacyPasskey(accessPoint),
    )

    if (!passkeyAccessPoints.length)
      throw new PasskeyNotConfirmedError("No passkeys registered")

    const credentialIds = passkeyAccessPoints.map(
      (accessPoint) => accessPoint.credential_id[0]!,
    )
    const passkeys = await getPasskey(credentialIds)
    const credentials = passkeys.map((passkey) => {
      const decoded = JSON.parse(passkey.data)
      return {
        credentialId: base64url.toBuffer(decoded.credentialId),
        publicKey: Buffer.from(decoded.publicKey, "hex"),
        credentialStringId: passkey.key,
      }
    })

    const passkeySignIdentity = new PasskeySignIdentity(credentials)
    const { sessionKey, chain } =
      await requestFEDelegationChain(passkeySignIdentity)
    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chain,
    )

    await authState.set({
      identity: passkeySignIdentity.resolvedIdentity!,
      delegationIdentity,
      chain,
      sessionKey,
    })
  }

  private isNonLegacyPasskey(accessPoint: AccessPointResponse): boolean {
    return (
      hasOwnProperty(accessPoint.device_type, "Passkey") &&
      !!accessPoint.credential_id[0]?.length
    )
  }
}

export const reauthenticationService = new ReauthenticationService()
