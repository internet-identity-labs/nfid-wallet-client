import {
  AuthorizationMachineContext,
  AuthSession,
} from "frontend/state/authorization"

import { fetchDelegate as _fetchDelegate } from "."

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
