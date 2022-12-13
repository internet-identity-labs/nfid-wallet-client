import React from "react"
import useSWR from "swr"

import { Application } from "@nfid/integration"

import { mapApplicationAccounts } from "frontend/apps/identity-manager/profile/applications/utils"

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
    (_, predicate) => fetchApplications(predicate),
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

export const useApplicationAccounts = () => {
  const { isLoading: isLoadingAppMeta, applicationsMeta } =
    useApplicationsMeta()
  const { isLoading: isLoadingProfile, profile } = useProfile()

  const applicationAccounts = React.useMemo(
    () =>
      mapApplicationAccounts(profile?.accounts || [], applicationsMeta || []),
    [profile?.accounts, applicationsMeta],
  )

  return {
    isLoading: isLoadingAppMeta || isLoadingProfile,
    applicationAccounts,
  }
}
