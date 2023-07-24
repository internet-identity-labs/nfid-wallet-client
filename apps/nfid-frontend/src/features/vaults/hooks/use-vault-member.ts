import { SignIdentity } from "@dfinity/agent"
import { principalToAddress } from "ictool"
import { useMemo } from "react"

import { useVaultDelegation } from "./use-vault-delegation"

export const useVaultMember = () => {
  const { data: delegation, isLoading, isValidating } = useVaultDelegation()

  const userAddress = useMemo(() => {
    if (!delegation) return ""

    return principalToAddress(delegation.getPrincipal(), Array(32).fill(1))
  }, [delegation])

  return {
    address: userAddress,
    identity: delegation as SignIdentity,
    isLoading: isValidating,
    isReady: !isLoading,
  }
}
