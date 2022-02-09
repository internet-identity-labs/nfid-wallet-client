import { CONFIG } from "frontend/config"
import {
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/services/identity-manager/identity_manager"
import produce from "immer"
import { useAtom } from "jotai"
import React from "react"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"
import { accountAtom, LocalAccount, userNumberAtom } from "./state"

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account"
>

export const useAccount = () => {
  const [account, setAccount] = useAtom(accountAtom)
  const [userNumber] = useAtom(userNumberAtom)

  const createAccount = React.useCallback(
    async (accountService: AccountService, account: HTTPAccountRequest) => {
      const response = await accountService.create_account(account)
      const newAccount = response.data[0]

      if (newAccount) {
        setAccount({ ...newAccount, anchor: newAccount.anchor.toString() })
      }
      return response
    },
    [setAccount],
  )

  const readAccount = React.useCallback(
    async (accountService?: AccountService) => {
      if (!accountService) throw new Error('"accountService" is required')
      const response = await accountService.get_account()
      const newAccount = response.data[0]

      if (newAccount) {
        setAccount({ ...newAccount, anchor: newAccount.anchor.toString() })
      }
    },
    [setAccount],
  )

  const resetLocalAccount = React.useCallback(async () => {
    const localAccount = JSON.parse(
      window.localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY) || "{}",
    ) as LocalAccount

    setAccount(localAccount)
  }, [setAccount])

  const updateAccount = React.useCallback(
    (partialAccount: Partial<LocalAccount>) => {
      const newAccount = produce(account, (draft: LocalAccount) => ({
        ...draft,
        ...partialAccount,
      }))
      setAccount(newAccount)
    },
    [account, setAccount],
  )

  const verifyPhonenumber = async (phoneNumber: string) => {
    const response = await fetch(`${CONFIG.VERIFY_PHONE_NUMBER}`, {
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
    account,
    userNumber,
    createAccount,
    readAccount,
    resetLocalAccount,
    updateAccount,
    verifyPhonenumber,
  }
}
