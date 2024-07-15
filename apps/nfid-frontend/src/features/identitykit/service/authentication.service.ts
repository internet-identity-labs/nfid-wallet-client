import { DelegationIdentity } from "@dfinity/identity"

import { authState, isDelegationExpired } from "@nfid/integration"

const checkExpiration = (delegationIdentity: DelegationIdentity) => {
  if (isDelegationExpired(delegationIdentity))
    throw new Error("Delegation expired")
  return true
}

export const checkAuthenticationStatus = async () => {
  const auth = authState.get()
  if (auth.delegationIdentity) return checkExpiration(auth.delegationIdentity)

  const cachedAuth = await authState.fromCache()
  if (cachedAuth.delegationIdentity)
    return checkExpiration(cachedAuth.delegationIdentity)

  return true
}
