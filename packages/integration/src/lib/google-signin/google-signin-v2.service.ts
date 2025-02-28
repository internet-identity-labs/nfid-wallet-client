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
      token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiODYxNGZmNjI4OTNiYWRjZTVhYTc5YTc3MDNiNTk2NjY1ZDI0NzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMzk4NzIyODY2NzEtODdvb3UzYWRudmw3aHN0OWdkOTByOWs3ajZlbmw3dmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMzk4NzIyODY2NzEtODdvb3UzYWRudmw3aHN0OWdkOTByOWs3ajZlbmw3dmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg0MTk2ODM2NTY3NTkyMDUwODciLCJoZCI6ImlkZW50aXR5bGFicy5vb28iLCJlbWFpbCI6Im9sZWtzYW5kckBpZGVudGl0eWxhYnMub29vIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTczNTU2ODQ4OSwibmFtZSI6Ik9sZWtzYW5kciBEaXVrYXJldiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMREVmVlNCblJuc0FaRC0tMzZqanVROGFxZkM1ZlRzMnNmNlJMVjBSZ1Jka2ZLcFE9czk2LWMiLCJnaXZlbl9uYW1lIjoiT2xla3NhbmRyIiwiZmFtaWx5X25hbWUiOiJEaXVrYXJldiIsImlhdCI6MTczNTU2ODc4OSwiZXhwIjoxNzM1NTcyMzg5LCJqdGkiOiIzNGU0NGZlNWZmYWEwZjE5MTI1MzQxM2Y3MmE1MGE5OWUyNjY0NjNmIn0.EDsBFl1NeZ6kePPqh0fMoVQNqeKXx-mohMI1sCrvz9DbF3cz4gj5ldosMTbv81M78KPfDWGZw-C3IvK0420YpOjL53y2M-kNjamC_t2nhzbW_l6GGjkntLNMyGezr1Qr16pnAsC-Bl8smNbC0V4dVBbjxSPxwalOv49EU9TIMxuNhA4099Z2HKsH63BW8amDwHT5MiCrs_CcegAKvYwPMavSZrI66x8woUyHbYl3ghCGewgBH3RJtC8-YMx3rFELEjIM1DQw0FMIiR-Dek_AoA0aHwQGkKIf0jibGQ7caNG9vKOuvCs_jdX3OIynwgsedliUlEFZ5AgfCCqo1F0JXQ",
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
