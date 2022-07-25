import { reverseMapOptional } from "../_common"
import { loadProfileFromLocalStorage } from "../identity-manager/profile"
import {
  authState,
  buildSerializableSignedDelegation,
} from "../internet-identity"
import { buildRemoteLoginRegisterMessage, postMessages } from "../pubsub"
import { AuthSession } from "frontend/state/authentication"

export async function postRemoteDelegationService(
  context: { pubsubChannel: string },
  event: { data: AuthSession },
): Promise<void> {
  console.debug("postRemoteDelegationService", { context, event })
  const { chain, sessionKey } = authState.get()
  if (!chain)
    throw new Error("postRemoteDelegationService authState missing chain")
  if (!sessionKey)
    throw new Error("postRemoteDelegationService authState missing sessionKey")

  const profile = loadProfileFromLocalStorage()
  if (!profile)
    throw new Error(
      "postRemoteDelegationService profile missing from localstorage",
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
