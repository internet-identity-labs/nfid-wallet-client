import { SignIdentity } from "@dfinity/agent"
import { principalToAddress } from "ictool"
import { useMemo } from "react"

import { useVaultDelegation } from "./use-vault-delegation"

export const useVaultMember = () => {
  const {
    data: UserIIDelegation,
    isLoading,
    isValidating,
  } = useVaultDelegation()

  const userAddress = useMemo(() => {
    if (!UserIIDelegation) return ""

    return principalToAddress(
      UserIIDelegation.getPrincipal(),
      Array(32).fill(1),
    )
  }, [UserIIDelegation])

  return {
    address: userAddress,
    identity: UserIIDelegation as SignIdentity,
    isLoading: isValidating,
    isReady: !isLoading,
  }
}
