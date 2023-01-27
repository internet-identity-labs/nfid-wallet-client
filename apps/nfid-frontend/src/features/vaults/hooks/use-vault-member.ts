import { SignIdentity } from "@dfinity/agent"
import { principalToAddress } from "ictool"
import { useMemo } from "react"

import { useProfile } from "frontend/integration/identity-manager/queries"

import { useVaultDelegation } from "./use-vault-delegation"

export const useVaultMember = () => {
  const { profile } = useProfile()
  const {
    data: UserIIDelegation,
    isLoading,
    isValidating,
  } = useVaultDelegation(profile?.anchor)

  const userAddress = useMemo(() => {
    if (!UserIIDelegation) return ""

    return principalToAddress(
      UserIIDelegation.getPrincipal(),
      Array(32).fill(1),
    )
  }, [UserIIDelegation])

  return {
    address: userAddress,
    anchor: profile?.anchor,
    identity: UserIIDelegation as SignIdentity,
    isLoading: isValidating,
    isReady: !isLoading,
  }
}
