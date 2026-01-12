import { useMemo } from "react"
import { useParams } from "react-router-dom"

import { getPolicies } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { useVaultWallets } from "./use-vault-wallets"

export const useVaultPolicies = () => {
  const { vaultId } = useParams()
  const { wallets } = useVaultWallets()

  const { data, isLoading, isValidating, mutate } = useSWR(
    vaultId ? `vault_${vaultId}_policies` : null,
    () => getPolicies(BigInt(vaultId ?? "")),
  )

  const policiesWithWalletName = useMemo(() => {
    return data?.map((policy) => ({
      ...policy,
      walletName: policy.wallets
        ? wallets?.find((w) => w.uid === policy.wallets?.[0])?.name
        : "Any",
    }))
  }, [data, wallets])

  return {
    vaultId,
    isFetching: isLoading || isValidating,
    refetch: mutate,
    policies: policiesWithWalletName,
  }
}
