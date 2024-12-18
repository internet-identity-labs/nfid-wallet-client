import { WALLET_SESSION_TTL_2_MIN_IN_NS } from "@nfid/config"
import { useSWR } from "@nfid/swr"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

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
    },
  )
}
