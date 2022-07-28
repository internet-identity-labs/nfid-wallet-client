import { AuthSession } from "frontend/state/authentication"

import { loadProfileFromLocalStorage } from "../identity-manager/profile"
import { authState } from "../internet-identity"
import { buildRemoteLoginRegisterMessage, postMessages } from "../pubsub"

export async function postRemoteDelegationService(
  context: { pubsubChannel?: string },
  event: { data: AuthSession },
): Promise<void> {
  console.debug(postRemoteDelegationService.name, { context, event })
  const { chain, sessionKey } = authState.get()
  if (!chain)
    throw new Error(
      `${postRemoteDelegationService.name} authState missing chain`,
    )
  if (!sessionKey)
    throw new Error(
      `${postRemoteDelegationService.name} authState missing sessionKey`,
    )

  if (!context.pubsubChannel)
    throw new Error(
      `${postRemoteDelegationService.name} context.pubsubChannel missing`,
    )

  const profile = loadProfileFromLocalStorage()
  if (!profile)
    throw new Error(
      `${postRemoteDelegationService.name} profile missing from localstorage`,
    )

  const message = buildRemoteLoginRegisterMessage(
    BigInt(profile.anchor),
    chain,
    sessionKey,
  )

  const response = await postMessages(context.pubsubChannel, [message])
  console.debug(`${postRemoteDelegationService.name} postMessage`, { response })
  return undefined
}
