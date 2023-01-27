import useSWR from "swr"

import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { replaceActorIdentity, vault } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const useVaultDelegation = (
  userNumber?: number,
  hostName?: string,
  personaId?: string,
) => {
  return useSWR(
    userNumber ? [userNumber, hostName, personaId] : null,
    ([userNumber, hostName, personaId]) =>
      getWalletDelegation(userNumber, hostName, personaId),
    {
      refreshInterval: WALLET_SESSION_TTL_1_MIN_IN_MS,
      onSuccess: async (data) => {
        if (data) await replaceActorIdentity(vault, data)
        return data
      },
    },
  )
}
