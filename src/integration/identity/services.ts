import { ThirdPartyAuthSession } from "frontend/state/authorization"

import { reverseMapOptional } from "../_common"
import { loadProfileFromLocalStorage } from "../identity-manager/profile"
import {
  authState,
  buildSerializableSignedDelegation,
} from "../internet-identity"
import { buildRemoteLoginRegisterMessage, postMessages } from "../pubsub"

export async function postRemoteDelegationService(
  context: { pubsubChannel: string },
  event: { data: ThirdPartyAuthSession },
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
    buildSerializableSignedDelegation(Array.from(event.data.userPublicKey), {
      ...event.data.signedDelegation,
      delegation: {
        ...event.data.signedDelegation.delegation,
        targets: reverseMapOptional(
          event.data.signedDelegation.delegation.targets,
        ),
      },
    }),
  )

  const response = await postMessages(context.pubsubChannel, [message])
  console.debug(`${postRemoteDelegationService.name} postMessage`, { response })
  return undefined
}
