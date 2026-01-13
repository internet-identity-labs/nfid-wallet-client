import { useMemo } from "react"
import { useParams } from "react-router-dom"

import { VaultRole } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { getVaultById } from "../services"

import { useVaultMember } from "./use-vault-member"

export const useVault = () => {
  const { vaultId } = useParams()
  const { address } = useVaultMember()

  const {
    data: vault,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(vaultId ? `vault_${vaultId}` : null, () =>
    getVaultById(vaultId ?? ""),
  )

  const isAdmin = useMemo(() => {
    const vaultMember = vault?.members.find(
      (member) => member.userId === address,
    )

    return vaultMember?.role === VaultRole.ADMIN
  }, [address, vault?.members])

  return {
    isFetching: isLoading || isValidating,
    refetch: mutate,
    vault,
    isAdmin,
  }
}
