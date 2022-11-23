import { DelegationIdentity } from "@dfinity/identity"

export const isDelegationExpired = (
  delegationIdentity?: DelegationIdentity,
): boolean => {
  if (!delegationIdentity) return true

  let isExpired = false

  for (const { delegation } of delegationIdentity.getDelegation().delegations) {
    const expiration = new Date(Number(delegation.expiration / BigInt(1000000)))
    const now = new Date()

    if (+expiration <= +now) {
      console.debug("isDelegationExpired", {
        isExpired: true,
        expirationDate: expiration,
        nowDate: now,
      })

      isExpired = true
      break
    }
  }
  return isExpired
}
