import { useParams } from "react-router-dom"
import useSWR from "swr"

import { getVaultById } from "../services"

export const useVault = () => {
  const { vaultId } = useParams()

  const {
    data: vault,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(`vault_${vaultId}`, () => getVaultById(vaultId ?? ""))

  return {
    isFetching: isLoading || isValidating,
    refetch: mutate,
    vault,
  }
}
