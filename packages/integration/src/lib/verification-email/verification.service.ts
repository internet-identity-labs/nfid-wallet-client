import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import * as jose from "jose"

import { ic } from "../agent"

export type VerificationStatus = "success" | "invalid-token" | "link-required"
export type VerificationMethod = "email"
export type RequestId = string
export type KeyPair = { publicKey: string; privateKey: string }
export type SendVerificationResponse = { keyPair: KeyPair; requestId: string }
export type SendVerificationEmailRequest = {
  verificationMethod: VerificationMethod
  emailAddress: string
}

export class PrevTokenHasNotExpiredError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export class VerificationIsInProgressError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

const sendVerificationEmailEndpointUrl = "/send_verification_email"
const checkVerificationEndpointUrl = "/check_verification"
const verifyEmailEndpointUrl = "/verify_email"

export const verificationService = {
  async sendVerification({
    verificationMethod,
    emailAddress,
  }: SendVerificationEmailRequest): Promise<SendVerificationResponse> {
    const url = ic.isLocal
      ? sendVerificationEmailEndpointUrl
      : AWS_SEND_VERIFICATION_EMAIL

    const keyPair = await generateCryptoKeyPair()
    const body = { email: emailAddress, publicKey: keyPair.publicKey }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    if (!response.ok) {
      if (response.status === 429) {
        throw new PrevTokenHasNotExpiredError(text)
      }
      throw new Error(text)
    }

    const requestId = JSON.parse(text).requestId

    return { keyPair, requestId }
  },

  async verify(
    verificationMethod: VerificationMethod,
    token: string,
  ): Promise<VerificationStatus> {
    const url = ic.isLocal ? verifyEmailEndpointUrl : AWS_VERIFY_EMAIL

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const text = await response.text()
      if (response.status === 400) {
        return "invalid-token"
      }
      throw new Error(text)
    }

    return "success"
  },

  async checkVerification(
    verificationMethod: VerificationMethod,
    emailAddress: string,
    keypair: KeyPair,
    requestId: string,
    nonce: number,
  ): Promise<DelegationIdentity> {
    const url = ic.isLocal
      ? checkVerificationEndpointUrl
      : AWS_CHECK_VERIFICATION

    const privateKey = await jose.importPKCS8(keypair.privateKey, "ES512")
    const token = await new jose.SignJWT({ nonce: nonce.toString() })
      .setProtectedHeader({ alg: "ES512" })
      .setIssuer("https://nfid.one")
      .setSubject(emailAddress)
      .setAudience("https://nfid.one")
      .setExpirationTime("20s")
      .setNotBefore(0)
      .setJti(requestId)
      .setIssuedAt()
      .sign(privateKey)

    const body = { token }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    if (!response.ok) {
      if (response.status === 423) {
        throw new VerificationIsInProgressError(text)
      }
      throw new Error(text)
    }

    const json = JSON.parse(text)
    const chain = JSON.parse(json.delegation).chain
    const sessionKey = JSON.parse(json.delegation).sessionKey
    const delegationChain = DelegationChain.fromJSON(chain)
    const ed25519KeyIdentity = Ed25519KeyIdentity.fromParsedJson(sessionKey)
    const delegation = DelegationIdentity.fromDelegation(
      ed25519KeyIdentity,
      delegationChain,
    )

    return delegation
  },
}

export async function generateCryptoKeyPair(): Promise<{
  publicKey: string
  privateKey: string
}> {
  const { privateKey, publicKey } = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-521",
    },
    true,
    ["sign", "verify"],
  )

  const publicKeyPem = await exportKeyToPem(publicKey, "PUBLIC KEY", "spki")
  const privateKeyPem = await exportKeyToPem(privateKey, "PRIVATE KEY", "pkcs8")

  return { publicKey: publicKeyPem, privateKey: privateKeyPem }
}

async function exportKeyToPem(
  key: CryptoKey,
  keyType: "PUBLIC KEY" | "PRIVATE KEY",
  format: "pkcs8" | "spki",
) {
  const exportedKey = await window.crypto.subtle.exportKey(format, key)
  const exportedKeyBuffer = new Uint8Array(exportedKey)
  const exportedKeyBase64 = window.btoa(
    String.fromCharCode.apply(null, Array.from(exportedKeyBuffer)),
  )

  const pemExportedPublicKey = `-----BEGIN ${keyType}-----\n${exportedKeyBase64}\n-----END ${keyType}-----`

  return pemExportedPublicKey
}
