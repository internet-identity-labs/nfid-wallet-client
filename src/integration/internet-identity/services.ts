import { WebAuthnIdentity } from "@dfinity/identity"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizationMachineContext } from "frontend/state/machines/authorization"

import { fetchDelegate as _fetchDelegate, registerInternetIdentity } from "."
import { deviceInfo } from "../device"

export async function fetchDelegate(
  context: AuthorizationMachineContext,
): Promise<AuthSession> {
  throw new Error("Not implemented")
  //   if (!context.session) throw new Error("No session")
  //   return _fetchDelegate(
  //     Number(context.session.anchor),
  //     "",
  //     Array.from(
  //       new Uint8Array(context.session.sessionKey.getPublicKey().toDer()),
  //     ),
  //     0,
  //   )
}

export async function login(): Promise<AuthSession> {
  throw new Error("Not implemented")
}

export function register(
  context: { authSession?: AuthSession; challengeKey?: string },
  event: { data: string },
): Promise<number> {
  if (!context.authSession || !context.challengeKey) {
    throw new Error(`Missing require registration context.`)
  }
  return registerInternetIdentity(
    context.authSession.identity as WebAuthnIdentity,
    deviceInfo.newDeviceName,
    { key: context.challengeKey, chars: event.data },
  )
}
