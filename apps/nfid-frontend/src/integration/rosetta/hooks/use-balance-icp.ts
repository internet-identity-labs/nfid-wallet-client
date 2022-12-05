import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import useSWR from "swr"

import { getBalance } from "@nfid/integration"

export function useBalanceICP(principal: Principal) {
  const { data: balance, ...rest } = useSWR(
    [principalToAddress(principal)],
    getBalance,
    {
      dedupingInterval: 60000,
      refreshInterval: 60000,
    },
  )

  return {
    balance,
    ...rest,
  }
}
