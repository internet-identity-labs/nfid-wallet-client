import { DelegationIdentity } from "@dfinity/identity"

import { authState } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AuthSession } from "frontend/state/authentication"

export const CheckAuthState = async (): Promise<{
  authSession: AuthSession
}> => {
  console.debug("CheckAuthState")
  let delegation: DelegationIdentity | undefined

  try {
    const { delegationIdentity } = await authState.fromCache()
    delegation = delegationIdentity
  } catch {
    console.debug("CheckAuthState: failed getting cache")
    throw new Error("CheckAuthState: failed getting cache")
  }
  console.debug("CheckAuthState", { delegation })

  if (!delegation) throw new Error("CheckAuthState: no auth session in cache")

  const { anchor } = await fetchProfile()

  return {
    authSession: {
      anchor,
      sessionSource: "cache",
      delegationIdentity: delegation,
    },
  }
}
