import { DerEncodedPublicKey, Signature } from "@icp-sdk/core/agent"
import { Delegation, DelegationChain } from "@icp-sdk/core/identity"

import { ThirdPartyAuthSession } from "./types"

export const getDelegationChain = (delegation: ThirdPartyAuthSession) => {
  return DelegationChain.fromDelegations(
    [
      {
        delegation: new Delegation(
          new Uint8Array(delegation.signedDelegation.delegation.pubkey),
          delegation.signedDelegation.delegation.expiration,
          delegation.signedDelegation.delegation.targets,
        ),
        signature: new Uint8Array(
          delegation.signedDelegation.signature,
        ) as Signature,
      },
    ],
    new Uint8Array(delegation.userPublicKey) as DerEncodedPublicKey,
  )
}
