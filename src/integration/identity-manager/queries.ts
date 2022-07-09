import useSWR from "swr"

import { fetchAccount } from "."

export function useAccount() {
  return useSWR("account/fetch", fetchAccount, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
}
