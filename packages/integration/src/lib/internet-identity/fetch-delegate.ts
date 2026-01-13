import { PublicKey } from "../_ic_api/internet_identity.d"

import { getDelegateRetry } from "./get-delegate"
import { prepareDelegate } from "./prepare-delegate"
import { ThirdPartyAuthSession } from "./types"

export async function fetchDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  maxTimeToLive?: bigint, // in ns
): Promise<ThirdPartyAuthSession> {
  console.debug("fetchDelegate", {
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive,
  })
  const prepare = await prepareDelegate(
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive ? BigInt(maxTimeToLive) : undefined,
  )

  const signedDelegation = await getDelegateRetry(
    userNumber,
    scope,
    sessionKey,
    prepare.timestamp,
  )

  return {
    scope,
    anchor: userNumber,
    signedDelegation,
    userPublicKey: prepare.userPublicKey,
  }
}
