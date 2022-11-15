import { DelegationIdentity } from "@dfinity/identity"

export const isDelegationExpired = (
  delegationIdentity?: DelegationIdentity,
): boolean => {
  if (!delegationIdentity) return true

  let isExpired = false

  for (const { delegation } of delegationIdentity.getDelegation().delegations) {
    if (
      +new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()
    ) {
      isExpired = true
      break
    }
  }
  return isExpired
}
