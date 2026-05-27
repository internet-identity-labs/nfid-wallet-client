import { SignIdentity } from "@icp-sdk/core/agent"
import { DelegationChain, DelegationIdentity } from "@icp-sdk/core/identity"

export const delegationIdentityFromSignedIdentity = (
  sessionKey: Pick<SignIdentity, "sign">,
  chain: DelegationChain,
): DelegationIdentity => {
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  return delegationIdentity
}
