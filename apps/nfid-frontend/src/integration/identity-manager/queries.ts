import { useSWR } from "@nfid/swr"

import { Application } from "@nfid/integration"

import { fetchAccounts, fetchApplications, fetchProfile } from "."

export function useAccounts() {
  const {
    data: accounts,
    isValidating: isLoading,
    error,
  } = useSWR(`accounts`, fetchAccounts)
  return { accounts, isLoading, error }
}

export function useProfile() {
  const {
    data,
    error,
    mutate: refreshProfile,
  } = useSWR("account/fetch", fetchProfile, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
  return {
    isLoading: !data && !error,
    refreshProfile,
    profile: data,
  }
}

export function useApplicationsMeta(
  predicate?: (application: Application) => boolean,
) {
  const {
    data,
    error,
    mutate: refreshApplicationMeta,
  } = useSWR(
    ["applications/meta", predicate],
    ([, predicate]) => fetchApplications(predicate),
    {
      dedupingInterval: 5 * 60_000,
      focusThrottleInterval: 5 * 60_000,
    },
  )

  return {
    isLoading: !data && !error,
    refreshApplicationMeta,
    applicationsMeta: data,
  }
}
