import produce from "immer"
import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import {
  AccountResponse,
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/services/identity-manager/identity_manager.did"

import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"
import {
  accountRecoveryAtom,
  accountRegisteredAtom,
  LocalAccount,
  userNumberAtom,
} from "./state"

declare const VERIFY_PHONE_NUMBER: string

const normalizeLocalAccount = ({
  account,
  newAccount,
}: {
  account?: LocalAccount
  isRecoveryDelegate: Boolean
  newAccount: AccountResponse
}) => ({
  name: newAccount.name[0],
  anchor: newAccount.anchor.toString(),
  skipPersonalize: !!newAccount.name[0] || !!account?.skipPersonalize,
})

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account" | "recover_account"
>

export const useAccount = () => {
  const [account, setAccount] = useAtom(accountRegisteredAtom)
  const [accountRecovery, setAccountRecovery] = useAtom(accountRecoveryAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const { isRecoveryDelegate, identityManager: accountService } =
    useAuthentication()

  const createAccount = React.useCallback(
    async (account: HTTPAccountRequest) => {
      if (!accountService) throw new Error('"accountService" is required')
      const response = await accountService.create_account(account)
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
    [accountService, setAccount],
  )

  const recoverAccount = React.useCallback(
    async (userNumber: bigint) => {
      if (!accountService) throw new Error('"accountService" is required')

      const response = await accountService.recover_account(userNumber)

      const newAccount = response.data[0]

      if (newAccount) {
        const normalizedAccount = normalizeLocalAccount({
          isRecoveryDelegate,
          account,
          newAccount,
        })
        setAccount(normalizedAccount)
      }

      return response
    },
    [account, accountService, isRecoveryDelegate, setAccount],
  )

  const readAccount = React.useCallback(async () => {
    if (!accountService) throw new Error('"accountService" is required')

    const response = await accountService.get_account()

    const newAccount = response.data[0]

    if (newAccount) {
      const normalizedAccount = normalizeLocalAccount({
        isRecoveryDelegate,
        account,
        newAccount,
      })
      isRecoveryDelegate
        ? setAccountRecovery(normalizedAccount)
        : setAccount(normalizedAccount)
    }

    return response
  }, [
    account,
    accountService,
    isRecoveryDelegate,
    setAccount,
    setAccountRecovery,
  ])

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
      await accountService.update_account({
        name: newAccount.name ? [newAccount.name] : [],
      })

      setAccount(newAccount)
    },
    [account, setAccount],
  )

  const verifyPhonenumber = async (phoneNumber: string) => {
    const response = await fetch(`${VERIFY_PHONE_NUMBER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
      }),
    })

    const data = await response.json()

    const validPhonenumber = response.status === 200

    return { response: data, validPhonenumber }
  }

  return {
    account: account || accountRecovery,
    userNumber,
    setLocalAccount: setAccount,
    createAccount,
    readAccount,
    recoverAccount,
    resetLocalAccount,
    updateAccount,
    verifyPhonenumber,
  }
}
