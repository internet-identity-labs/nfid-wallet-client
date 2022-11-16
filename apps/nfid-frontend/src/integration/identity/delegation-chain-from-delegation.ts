import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import { Delegation, DelegationChain } from "@dfinity/identity"

import { ThirdPartyAuthSession } from "frontend/state/authorization"

export const delegationChainFromDelegation = ({
  signedDelegation,
  userPublicKey,
}: ThirdPartyAuthSession): DelegationChain => {
  return DelegationChain.fromDelegations(
    [
      {
        delegation: new Delegation(
          new Uint8Array(signedDelegation.delegation.pubkey).buffer,
          signedDelegation.delegation.expiration,
          signedDelegation.delegation.targets,
        ),
        signature: new Uint8Array(signedDelegation.signature)
          .buffer as Signature,
      },
    ],
    new Uint8Array(userPublicKey).buffer as DerEncodedPublicKey,
  )
}
