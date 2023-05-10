import { authState, loadProfileFromLocalStorage } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthSession } from "frontend/state/authentication"

export const CheckAuthState = async (): Promise<AuthSession> => {
  const { delegationIdentity } = await authState.fromCache()

  if (!delegationIdentity)
    throw new Error("CheckAuthState: no auth session in cache")

  const { anchor } = loadProfileFromLocalStorage() ?? (await fetchProfile())

  return {
    anchor,
    sessionSource: "cache",
    delegationIdentity,
  }
}
