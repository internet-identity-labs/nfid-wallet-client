import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ic } from "../agent"

export type VerificationStatus = "success" | "invalid-token" | "link-required"
export type VerificationMethod = "email"
export type RequestId = string
export type KeyPair = { publicKey: string; privateKey: string }
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
  }: SendVerificationEmailRequest): Promise<KeyPair> {
    const url = ic.isLocal
      ? sendVerificationEmailEndpointUrl
      : AWS_SEND_VERIFICATION_EMAIL

    const keyPair = { publicKey: "", privateKey: "" }
    const body = { email: emailAddress, publicKey: keyPair.publicKey }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      if (response.status === 429) {
        throw new PrevTokenHasNotExpiredError(text)
      }
      throw new Error(text)
    }

    return keyPair
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
  ): Promise<DelegationIdentity> {
    const url = ic.isLocal
      ? checkVerificationEndpointUrl
      : AWS_CHECK_VERIFICATION

    // TODO: due to absence crypto on the FE, temp comment.
    // const payload = {
    //   sub: emailAddress,
    // }

    // const token: string = jwt
    //   .sign(payload, keypair.privateKey, { algorithm: "ES512" })
    //   .toString()
    const body = { token: emailAddress }

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
    const delegationChain = DelegationChain.fromJSON(json.chain)
    const ed25519KeyIdentity = Ed25519KeyIdentity.fromParsedJson(
      json.sessionKey,
    )
    const delegation = DelegationIdentity.fromDelegation(
      ed25519KeyIdentity,
      delegationChain,
    )

    return delegation
  },
}

// function generateCryptoKeyPair(): {
//   publicKey: string
//   privateKey: string
// } {
//   const { privateKey, publicKey } = generateKeyPairSync("ec", {
//     namedCurve: "secp521r1",
//   })
//   const privateKeyPem = privateKey
//     .export({ type: "sec1", format: "pem" })
//     .toString()
//   const publicKeyPem = publicKey
//     .export({ type: "spki", format: "pem" })
//     .toString()

//   return { publicKey: publicKeyPem, privateKey: privateKeyPem }
// }
