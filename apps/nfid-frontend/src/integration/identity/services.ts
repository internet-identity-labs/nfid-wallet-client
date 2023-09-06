import { authState } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import {
  buildRemoteLoginRegisterMessage,
  createTopic,
  postMessages,
} from "../pubsub"

export async function postRemoteDelegationService(
  context: { pubsubChannel?: string; authSession?: AuthSession },
  event: { data: AuthSession },
): Promise<void> {
  console.debug("postRemoteDelegationService", { context, event })
  const { chain, sessionKey } = (await authState).get()
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
