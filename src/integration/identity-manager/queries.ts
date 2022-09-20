import React from "react"
import useSWR from "swr"

import { mapApplicationAccounts } from "frontend/apps/identity-manager/profile/utils"

import { fetchApplications, fetchProfile } from "."

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

export function useApplicationsMeta() {
  const {
    data,
    error,
    mutate: refreshApplicationMeta,
  } = useSWR("applications/meta", fetchApplications, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })

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
