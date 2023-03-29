import { SignIdentity } from "@dfinity/agent"
import { DelegationChain, DelegationIdentity } from "@dfinity/identity"

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
