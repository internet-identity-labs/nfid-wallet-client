import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import { Delegation, DelegationChain } from "@dfinity/identity"

import { ThirdPartyAuthSession } from "frontend/state/authorization"

export const delegationChainFromDelegation = (
  delegation: ThirdPartyAuthSession,
): DelegationChain => {
  return DelegationChain.fromDelegations(
    [
      {
        delegation: new Delegation(
          new Uint8Array(delegation.signedDelegation.delegation.pubkey).buffer,
          delegation.signedDelegation.delegation.expiration,
          delegation.signedDelegation.delegation.targets,
        ),
        signature: new Uint8Array(delegation.signedDelegation.signature)
          .buffer as Signature,
      },
    ],
    new Uint8Array(delegation.userPublicKey).buffer as DerEncodedPublicKey,
  )
}
