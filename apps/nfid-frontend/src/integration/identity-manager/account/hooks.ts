import { useAtom } from "jotai"
import React from "react"
import useSWR from "swr"

import { unpackResponse } from "frontend/integration/_common"
import { HTTPAccountRequest } from "frontend/integration/_ic_api/identity_manager.d"
import { im } from "frontend/integration/actors"

import {
  CreateAccessPoint,
  fetchProfile,
  mapProfile,
  registerProfileWithAccessPoint,
} from ".."
import { setProfile } from "../profile"
import { userNumberAtom } from "./state"

declare const VERIFY_PHONE_NUMBER: string

/** @deprecated FIXME: move to integration layer */
export const useAccount = () => {
  const {
    data: profile,
    error,
    mutate: refreshProfile,
  } = useSWR("account", fetchProfile, {
    dedupingInterval: 60_000 * 5,
    focusThrottleInterval: 60_000 * 5,
  })

  const [userNumber] = useAtom(userNumberAtom)

  React.useEffect(() => {
    console.debug("useAccount", { profile, error })
  }, [profile, error])

  const createAccount = React.useCallback(
    async (
      account: HTTPAccountRequest,
      accessPoint: CreateAccessPoint,
      shouldStoreLocalAccount: boolean = true,
    ) => {
      const newAccount = await registerProfileWithAccessPoint(
        Number(account.anchor),
        accessPoint,
      )
      shouldStoreLocalAccount && setProfile(newAccount)
      refreshProfile()
      return newAccount
    },
    [refreshProfile],
  )

  const recoverAccount = React.useCallback(
    async (userNumber: bigint, shouldStoreLocalAccount: boolean) => {
      const newAccount = await im
        .recover_account(userNumber)
        .then(unpackResponse)
        .then(mapProfile)

      if (newAccount) {
        shouldStoreLocalAccount && setProfile(newAccount)
        refreshProfile()
      }

      return newAccount
    },
    [refreshProfile],
  )

  const verifyPhonenumber = React.useCallback(
    async (phoneNumber: string, principalId: string) => {
      const response = await fetch(`${VERIFY_PHONE_NUMBER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          principalId,
        }),
      })

      const data = await response.json()

      return { body: data, status: response.status }
    },
    [],
  )

  return {
    isLoading: !profile && !error,
    profile,
    refreshProfile,
    userNumber,
    createAccount,
    recoverAccount,
    verifyPhonenumber,
  }
}
