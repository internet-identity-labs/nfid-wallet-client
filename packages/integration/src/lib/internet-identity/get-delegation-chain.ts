import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import { Delegation, DelegationChain } from "@dfinity/identity"

import { ThirdPartyAuthSession } from "./types"

export const getDelegationChain = (delegation: ThirdPartyAuthSession) => {
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
