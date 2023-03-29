import { PublicKey } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { mapOptional } from "../ic-utils"
import { SignedDelegation } from "./types"

/**
 * Retrieve prepared third party auth session.
 * @param userNumber
 * @param scope
 * @param sessionKey
 * @param timestamp
 * @returns signed delegate
 */
export async function getDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  console.debug("getDelegate", { userNumber, scope, sessionKey, timestamp })

  return ii
    .get_delegation(BigInt(userNumber), scope, sessionKey, timestamp)
    .then((r) => {
      if ("signed_delegation" in r) {
        return {
          delegation: {
            expiration: r.signed_delegation.delegation.expiration,
            pubkey: r.signed_delegation.delegation.pubkey,
            targets: mapOptional(r.signed_delegation.delegation.targets),
          },
          signature: r.signed_delegation.signature,
        }
      }
      throw new Error("No such delegation")
    })
}

export async function getDelegateRetry(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  for (let i = 0; i < 10; i++) {
    try {
      // Linear backoff
      await new Promise((resolve) => {
        setInterval(resolve, 1000 * i)
      })
      return await getDelegate(userNumber, scope, sessionKey, timestamp)
    } catch (e) {
      console.warn("Failed to retrieve delegation.", e)
    }
  }
  throw new Error(`Failed to retrieve a delegation after ${10} retries.`)
}
