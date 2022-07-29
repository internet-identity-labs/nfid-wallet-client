import produce from "immer"
import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { unpackResponse } from "frontend/integration/_common"
import {
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/integration/_ic_api/identity_manager.did"
import { im } from "frontend/integration/actors"

import { mapProfile, Profile } from ".."
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"
import {
  memoryAccountAtom,
  localStorageAccountAtom,
  userNumberAtom,
} from "./state"

declare const VERIFY_PHONE_NUMBER: string

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account" | "recover_account"
>

/** @deprecated FIXME: move to integration layer */
export const useAccount = () => {
  const [account, setAccount] = useAtom(localStorageAccountAtom)
  const [memoryAccount, setMemoryAccount] = useAtom(memoryAccountAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const { isAuthenticated, shouldStoreLocalAccount } = useAuthentication()

  const createAccount = React.useCallback(
    async (account: HTTPAccountRequest) => {
      const newAccount = await im
        .create_account(account)
        .then(unpackResponse)
        .then(mapProfile)
      setAccount(newAccount)
      return newAccount
    },
    [setAccount],
  )

  const recoverAccount = React.useCallback(
    async (userNumber: bigint) => {
      const newAccount = await im
        .recover_account(userNumber)
        .then(unpackResponse)
        .then(mapProfile)

      if (newAccount) {
        shouldStoreLocalAccount
          ? setAccount(newAccount)
          : setMemoryAccount(newAccount)
      }

      return newAccount
    },
    [account, setAccount],
  )

  const readAccount = React.useCallback(async () => {
    const newAccount = await im
      .get_account()
      .then(unpackResponse)
      .then(mapProfile)

    if (newAccount) {
      shouldStoreLocalAccount
        ? setAccount(newAccount)
        : setMemoryAccount(newAccount)
    }

    return newAccount
  }, [account, shouldStoreLocalAccount, setAccount, setMemoryAccount])

  // Used when we do not want to use the local storage version of the account.
  // The account object is used as a flag to kickoff certain flows that do not make sense in particular use cases (recovery phrases, google, etc.)
  // Connection methods:
  // - just log me in (remote device)
  // - google
  // - recovery phrase (just log me in)
  const readMemoryAccount = React.useCallback(async () => {
    const newAccount = await im
      .get_account()
      .then(unpackResponse)
      .then(mapProfile)

    if (newAccount) {
      setMemoryAccount(newAccount)
    }

    return newAccount
  }, [account, setMemoryAccount])

  const readAndStoreAccount = React.useCallback(async () => {
    const newAccount = await im
      .get_account()
      .then(unpackResponse)
      .then(mapProfile)

    setAccount(newAccount)

    return newAccount
  }, [account, setAccount])

  const resetLocalAccount = React.useCallback(async () => {
    const localAccount = JSON.parse(
      window.localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY) || "{}",
    ) as Profile

    setAccount(localAccount)
  }, [setAccount])

  const updateAccount = React.useCallback(
    async (
      accountService: AccountService,
      partialAccount: Partial<Profile>,
    ) => {
      const newAccount = produce(account, (draft: Profile) => ({
        ...draft,
        ...partialAccount,
      }))
      if (!newAccount)
        throw new Error("useAccount.updateAccount account undefined")
      // NOTE: looks silly? `name` is an optional parameter :/
      await im
        .update_account({
          name: newAccount.name ? [newAccount.name] : [],
        })
        .catch((e) => {
          throw new Error(
            `useAccount.updateAccount im.update_account: ${e.message}`,
          )
        })

      shouldStoreLocalAccount
        ? setAccount(newAccount)
        : setMemoryAccount(newAccount)
    },
    [account, setAccount, setMemoryAccount, shouldStoreLocalAccount],
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
    account: isAuthenticated ? account || memoryAccount : account,
    userNumber,
    shouldStoreLocalAccount,
    setLocalAccount: setAccount,
    createAccount,
    readAccount,
    readAndStoreAccount,
    readMemoryAccount,
    recoverAccount,
    resetLocalAccount,
    updateAccount,
    verifyPhonenumber,
  }
}
