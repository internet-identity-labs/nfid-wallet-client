import { SignIdentity } from "@icp-sdk/core/agent"
import { uint8ArrayToHexString } from "@nfid-frontend/utils"
import { useMemo } from "react"

import { getAddress } from "frontend/util/get-address"

import { useVaultDelegation } from "./use-vault-delegation"

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
