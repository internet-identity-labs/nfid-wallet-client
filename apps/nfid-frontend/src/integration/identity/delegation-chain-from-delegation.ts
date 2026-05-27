import { DerEncodedPublicKey, Signature } from "@icp-sdk/core/agent"
import { Delegation, DelegationChain } from "@icp-sdk/core/identity"

import { ThirdPartyAuthSession } from "frontend/state/authorization"

export const delegationChainFromDelegation = ({
  signedDelegation,
  userPublicKey,
}: ThirdPartyAuthSession): DelegationChain => {
  return DelegationChain.fromDelegations(
    [
      {
        delegation: new Delegation(
          new Uint8Array(signedDelegation.delegation.pubkey),
          signedDelegation.delegation.expiration,
          signedDelegation.delegation.targets,
        ),
        signature: new Uint8Array(signedDelegation.signature) as Signature,
      },
    ],
    new Uint8Array(userPublicKey) as DerEncodedPublicKey,
  )
}
