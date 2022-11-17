import { Principal } from "@dfinity/principal"
import useSWR from "swr"

import { getBalance } from "../balance"

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
