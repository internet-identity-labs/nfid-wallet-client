import { useMemo } from "react"
import { useParams } from "react-router-dom"
import useSWR from "swr"

import { VaultRole } from "@nfid/integration"

import { getVaultById } from "../services"
import { useMemberAddress } from "./use-member-address"

export const useVault = () => {
  const { vaultId } = useParams()
  const { address } = useMemberAddress()

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
