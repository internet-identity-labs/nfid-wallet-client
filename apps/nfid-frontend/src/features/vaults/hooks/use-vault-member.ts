import { SignIdentity } from "@dfinity/agent"
import { useMemo } from "react"

import { useVaultDelegation } from "./use-vault-delegation"
import { getAddress } from "frontend/util/get-address"
import { uint8ArrayToHexString } from "@dfinity/utils"

export const useVaultMember = () => {
  const {
    data: UserIIDelegation,
    isLoading,
    isValidating,
  } = useVaultDelegation()

  const userAddress = useMemo(() => {
    if (!UserIIDelegation) return ""
    const hex = uint8ArrayToHexString(new Uint8Array(Array(32).fill(1)))
    return getAddress(UserIIDelegation.getPrincipal(), hex)
  }, [UserIIDelegation])

  return {
    address: userAddress,
    identity: UserIIDelegation as SignIdentity,
    isLoading: isValidating,
    isReady: !isLoading,
  }
}
