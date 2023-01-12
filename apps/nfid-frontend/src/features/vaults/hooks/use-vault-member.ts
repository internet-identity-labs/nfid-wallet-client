import { SignIdentity } from "@dfinity/agent"
import { principalToAddress } from "ictool"
import { useEffect, useMemo, useState } from "react"

import { replaceActorIdentity, vault } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { useWalletDelegation } from "frontend/integration/wallet/hooks/use-wallet-delegation"

export const useVaultMember = () => {
  const [isReady, setIsReady] = useState(false)
  const { profile } = useProfile()
  const { data: UserIIDelegation, isValidating } = useWalletDelegation(
    profile?.anchor,
  )

  const userAddress = useMemo(() => {
    if (!UserIIDelegation) return ""
    return principalToAddress(
      UserIIDelegation.getPrincipal(),
      Array(32).fill(1),
    )
  }, [UserIIDelegation])

  useEffect(() => {
    if (!UserIIDelegation) return
    replaceActorIdentity(vault, UserIIDelegation)
    setIsReady(true)
  }, [UserIIDelegation])

  return {
    address: userAddress,
    identity: UserIIDelegation as SignIdentity,
    isLoading: isValidating,
    isReady,
  }
}
