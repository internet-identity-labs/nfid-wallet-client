import { useSWR } from "@nfid/swr"

import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { replaceActorIdentity, vault } from "@nfid/integration"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"

export const useVaultDelegation = () => {
  return useSWR("vaultDelegation", () => getWalletDelegationAdapter(), {
    refreshInterval: WALLET_SESSION_TTL_1_MIN_IN_MS,
    onSuccess: async (data) => {
      if (data) await replaceActorIdentity(vault, data)
      return data
    },
  })
}
