import produce from "immer"
import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { im } from "frontend/comm/actors"
import {
  AccountResponse,
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/comm/idl/identity_manager.did"

import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"
import {
  memoryAccountAtom,
  localStorageAccountAtom,
  LocalAccount,
  userNumberAtom,
} from "./state"

declare const VERIFY_PHONE_NUMBER: string

const normalizeLocalAccount = ({
  account,
  newAccount,
}: {
  account?: LocalAccount
  newAccount: AccountResponse
}) => ({
  name: newAccount.name[0],
  anchor: newAccount.anchor.toString(),
  skipPersonalize: !!newAccount.name[0] || !!account?.skipPersonalize,
  phoneNumber: newAccount.phone_number.length
    ? newAccount.phone_number[0]
    : undefined,
})

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account" | "recover_account"
>

export const useAccount = () => {
  const [account, setAccount] = useAtom(localStorageAccountAtom)
  const [memoryAccount, setMemoryAccount] = useAtom(memoryAccountAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const { user, shouldStoreLocalAccount } = useAuthentication()

  const createAccount = React.useCallback(
    async (account: HTTPAccountRequest) => {
      const response = await im.create_account(account)
      const newAccount = response.data[0]

      if (newAccount) {
        setAccount({
          ...newAccount,
          name: newAccount.name[0],
          anchor: newAccount.anchor.toString(),
          skipPersonalize: false,
        })
      }
      return response
    },
    [setAccount],
  )

  const recoverAccount = React.useCallback(
    async (userNumber: bigint) => {
      const response = await im.recover_account(userNumber)

      const newAccount = response.data[0]

      if (newAccount) {
        const normalizedAccount = normalizeLocalAccount({
          account,
          newAccount,
        })
        setAccount(normalizedAccount)
      }

      return response
    },
    [account, setAccount],
  )

  const readAccount = React.useCallback(async () => {
    const response = await im.get_account()

    const newAccount = response.data[0]

    if (newAccount) {
      const normalizedAccount = normalizeLocalAccount({
        account,
        newAccount,
      })
      shouldStoreLocalAccount
        ? setAccount(normalizedAccount)
        : setMemoryAccount(normalizedAccount)
    }

    return response
  }, [account, shouldStoreLocalAccount, setAccount, setMemoryAccount])

  // Used when we do not want to use the local storage version of the account.
  // The account object is used as a flag to kickoff certain flows that do not make sense in particular use cases (recovery phrases, google, etc.)
  // Connection methods:
  // - just log me in (remote device)
  // - google
  // - recovery phrase (just log me in)
  const readMemoryAccount = React.useCallback(async () => {
    const response = await im.get_account()

    const newAccount = response.data[0]

    if (newAccount) {
      const normalizedAccount = normalizeLocalAccount({
        account,
        newAccount,
      })
      setMemoryAccount(normalizedAccount)
    }

    return response
  }, [account, setMemoryAccount])

  const readAndStoreAccount = React.useCallback(async () => {
    const response = await im.get_account()

    const newAccount = response.data[0]

    if (newAccount) {
      const normalizedAccount = normalizeLocalAccount({
        account,
        newAccount,
      })
      setAccount(normalizedAccount)
    }

    return response
  }, [account, setAccount])

  const resetLocalAccount = React.useCallback(async () => {
    const localAccount = JSON.parse(
      window.localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY) || "{}",
    ) as LocalAccount

    setAccount(localAccount)
  }, [setAccount])

  const updateAccount = React.useCallback(
    async (
      accountService: AccountService,
      partialAccount: Partial<LocalAccount>,
    ) => {
      const newAccount = produce(account, (draft: LocalAccount) => ({
        ...draft,
        ...partialAccount,
      }))
      if (!newAccount) throw new Error("account undefined")
      // NOTE: looks silly? `name` is an optional parameter :/
      await im.update_account({
        name: newAccount.name ? [newAccount.name] : [],
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
    account: user ? account || memoryAccount : account,
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
