import useSWR from "swr"

import { fetchProfile } from "."

export function useAccount() {
  return useSWR("account/fetch", fetchProfile, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
}
