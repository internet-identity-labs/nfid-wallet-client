import { Principal } from "@dfinity/principal"
import { getBalance } from "@nfid/integration"
import useSWR from "swr"

export function useBalanceICP(principal: Principal) {
  const { data: balance, ...rest } = useSWR([principal], getBalance, {
    dedupingInterval: 60000,
    refreshInterval: 60000,
  })

  return {
    balance,
    ...rest,
  }
}
