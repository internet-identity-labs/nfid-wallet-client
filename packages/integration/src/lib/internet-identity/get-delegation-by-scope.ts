import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { WALLET_SESSION_TTL_2_MIN_IN_NS } from "@nfid/config"

import { delegationIdentityFromSignedIdentity } from "./delegation-identity-from-signed-identity"
import { fetchDelegate } from "./fetch-delegate"
import { getDelegationChain } from "./get-delegation-chain"

export async function delegationByScope(
  userNumber: number,
  scope: string,
  maxTimeToLive?: bigint,
): Promise<DelegationIdentity> {
  const sessionKey = Ed25519KeyIdentity.generate()

  const delegation = await fetchDelegate(
    userNumber,
    scope,
    Array.from(new Uint8Array(sessionKey.getPublicKey().toDer())),
    typeof maxTimeToLive === "undefined"
      ? BigInt(WALLET_SESSION_TTL_2_MIN_IN_NS)
      : maxTimeToLive,
  )

  return delegationIdentityFromSignedIdentity(
    sessionKey,
    getDelegationChain(delegation),
  )
}
