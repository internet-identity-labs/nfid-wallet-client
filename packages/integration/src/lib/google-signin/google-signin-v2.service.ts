import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { DEFAULT_DELEGATION_TTL } from "@nfid/config"

import { ic } from "../agent"

const signinV2 = "/signin/v2"

interface GoogleSigninV2Service {
  signin(
    token: string,
    maxTimeToLive?: number,
  ): Promise<{
    delegation: DelegationIdentity
    identity: Ed25519KeyIdentity
    email: string
  }>
}

export const googleSigninV2Service: GoogleSigninV2Service = {
  async signin(
    token: string,
    maxTimeToLive = DEFAULT_DELEGATION_TTL,
  ): Promise<{
    delegation: DelegationIdentity
    identity: Ed25519KeyIdentity
    email: string
  }> {
    const url = ic.isLocal ? signinV2 : AWS_SIGNIN_GOOGLE_V2

    const ed25519KeyIdentity = Ed25519KeyIdentity.generate()
    const publicKeyDerHex = ed25519KeyIdentity.toJSON()[0]
    const request = {
      token,
      publicKey: publicKeyDerHex,
      delegationTtl: maxTimeToLive,
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })

    const text = await response.text()
    if (!response.ok) {
      throw new Error(text)
    }

    const json = JSON.parse(text)
    const delegationChain = DelegationChain.fromJSON(json.identity)
    const delegation = DelegationIdentity.fromDelegation(
      ed25519KeyIdentity,
      delegationChain,
    )

    return { delegation, identity: ed25519KeyIdentity, email: json.email }
  },
}
