import useSWR from "swr"

import { fetchApplications, fetchProfile } from "."

export function useAccount() {
  return useSWR("account/fetch", fetchProfile, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
}

export function useApplicationsMeta() {
  return useSWR("applications/meta", fetchApplications, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
}
