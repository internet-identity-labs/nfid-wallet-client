import { authState } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import {
  buildRemoteLoginRegisterMessage,
  createTopic,
  postMessages,
} from "../pubsub"

export async function postRemoteDelegationService(
  context: { pubsubChannel?: string; authSession?: AuthSession },
  _event: { data: AuthSession },
): Promise<void> {
  const { chain, sessionKey } = authState.get()
  if (!chain)
    throw new Error(`postRemoteDelegationService authState missing chain`)
  if (!sessionKey)
    throw new Error(`postRemoteDelegationService authState missing sessionKey`)

  if (!context.pubsubChannel)
    throw new Error(`postRemoteDelegationService context.pubsubChannel missing`)

  if (!context.authSession?.anchor)
    throw new Error(
      "postRemoteDelegationService context.authSession.anchor missing",
    )

  const message = buildRemoteLoginRegisterMessage(
    BigInt(context.authSession?.anchor),
    chain,
    sessionKey,
  )

  // FIXME: create topic earlier.
  await createTopic(context.pubsubChannel)
  const response = await postMessages(context.pubsubChannel, [message])
  console.debug(`postRemoteDelegationService postMessage`, { response })
  return undefined
}

export function arrayBufferEqual(a1: ArrayBuffer, a2: ArrayBuffer): boolean {
  if (a1 === a2) {
    return true
  }

  if (a1.byteLength !== a2.byteLength) {
    return false
  }

  return (
    JSON.stringify(Array.from(new Uint8Array(a1))) ===
    JSON.stringify(Array.from(new Uint8Array(a2)))
  )
}
