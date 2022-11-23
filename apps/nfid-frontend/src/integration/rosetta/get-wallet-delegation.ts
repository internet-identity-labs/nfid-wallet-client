import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import {
  delegationIdentityFromSignedIdentity,
  fetchDelegate,
} from "../internet-identity"
import { WALLET_SCOPE, WALLET_SESSION_TTL } from "./index"

export async function getWalletDelegation(
  userNumber: number,
): Promise<DelegationIdentity> {
  // TODO WALLET. Code review delegation
  // const scope = getScope(WALLET_SCOPE)
  const scope = WALLET_SCOPE
  const sessionKey = Ed25519KeyIdentity.generate()
  const maxTimeToLive = WALLET_SESSION_TTL

  if (!sessionKey)
    throw new Error("getWalletDelegation. Unable to create sessionKey")

  const delegation = await fetchDelegate(
    userNumber,
    scope,
    Array.from(new Uint8Array(sessionKey.getPublicKey().toDer())),
    maxTimeToLive,
  )

  return await delegationIdentityFromSignedIdentity(
    sessionKey,
    DelegationChain.fromDelegations(
      [
        {
          delegation: new Delegation(
            new Uint8Array(
              delegation.signedDelegation.delegation.pubkey,
            ).buffer,
            delegation.signedDelegation.delegation.expiration,
            delegation.signedDelegation.delegation.targets,
          ),
          signature: new Uint8Array(delegation.signedDelegation.signature)
            .buffer as Signature,
        },
      ],
      new Uint8Array(delegation.userPublicKey).buffer as DerEncodedPublicKey,
    ),
  )
}
