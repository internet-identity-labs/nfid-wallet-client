import { authState } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthSession } from "frontend/state/authentication"

export const CheckAuthState = async (): Promise<{
  authSession: AuthSession
}> => {
  console.debug("CheckAuthState")
  const { delegationIdentity } = await (await authState).fromCache()

  console.debug("CheckAuthState", { delegationIdentity })

  if (!delegationIdentity)
    throw new Error("CheckAuthState: no auth session in cache")

  const { anchor } = await fetchProfile()

  return {
    authSession: {
      anchor,
      sessionSource: "cache",
      delegationIdentity,
    },
  }
}
