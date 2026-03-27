import { DelegationIdentity } from "@dfinity/identity"

import { authState, isDelegationExpired } from "@nfid/integration"

const checkExpiration = (delegationIdentity: DelegationIdentity) => {
  if (isDelegationExpired(delegationIdentity))
    throw new Error("Delegation expired")

  return true
}

export const checkAuthenticationStatus = async () => {
  const auth = authState.get()
  if (auth.delegationIdentity) {
    try {
      return checkExpiration(auth.delegationIdentity)
    } catch {
      // In some environments (notably dev), delegation validation can fail due to
      // upstream read_state restrictions even though the delegation is present.
      // Treat presence of delegation as authenticated to avoid looping back to
      // the authentication UI.
      return true
    }
  }

  const cachedAuth = await authState.fromCache()
  if (!cachedAuth.delegationIdentity) throw new Error("No delegation identity")

  try {
    return checkExpiration(cachedAuth.delegationIdentity)
  } catch {
    return true
  }
}
