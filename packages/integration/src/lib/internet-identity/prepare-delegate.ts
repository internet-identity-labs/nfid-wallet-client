import { PublicKey } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { reverseMapOptional } from "../ic-utils"

/**
 * Prepare a third party auth session.
 * @param userNumber
 * @param scope
 * @param sessionKey session key generated and provided by 3rd party connecting app
 * @param maxTimeToLive
 * @returns public key and timestamp (for lookup)
 */
export async function prepareDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  maxTimeToLive?: bigint,
) {
  console.debug("prepareDelegate", {
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive,
  })
  return ii
    .prepare_delegation(
      BigInt(userNumber),
      scope,
      sessionKey,
      reverseMapOptional(maxTimeToLive ? maxTimeToLive : undefined),
    )
    .then(([userPublicKey, timestamp]) => ({
      userPublicKey: new Uint8Array(userPublicKey),
      timestamp,
    }))
}
