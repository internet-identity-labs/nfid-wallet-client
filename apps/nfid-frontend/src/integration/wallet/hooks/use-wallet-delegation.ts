import useSWR from "swr"

import { replaceActorIdentity, vault } from "@nfid/integration"

import {
  getWalletDelegation,
  WALLET_SESSION_TTL_2_MIN_IN_MS,
  WALLET_SESSION_TTL_2_MIN_IN_NS,
} from "frontend/integration/facade/wallet"

export const useWalletDelegation = (
  userNumber?: number,
  hostName?: string,
  personaId?: string,
) => {
  console.debug("useWalletDelegation", { userNumber })
  return useSWR(
    userNumber ? [userNumber, hostName, personaId] : null,
    ([userNumber, hostName, personaId]) =>
      getWalletDelegation(userNumber, hostName, personaId),
    {
      dedupingInterval: WALLET_SESSION_TTL_2_MIN_IN_NS / 2,
      focusThrottleInterval: WALLET_SESSION_TTL_2_MIN_IN_NS / 2,
      refreshInterval: WALLET_SESSION_TTL_2_MIN_IN_MS,
      onSuccess: (data) => {
        console.log(123, { data })
        if (data) replaceActorIdentity(vault, data)
        return data
      },
    },
  )
}
