import useSWR from "swr"

import { replaceActorIdentity, vault } from "@nfid/integration"

import {
  getWalletDelegation,
  WALLET_SESSION_TTL_2_MIN_IN_MS,
} from "frontend/integration/facade/wallet"

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
      refreshInterval: WALLET_SESSION_TTL_2_MIN_IN_MS,
      onSuccess: async (data) => {
        if (data) await replaceActorIdentity(vault, data)
        return data
      },
    },
  )
}
