import { CONFIG } from "frontend/config"
import {
  Account,
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/generated/identity_manager"
import produce from "immer"
import React from "react"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account"
>

type LocalAccount = Account & { rootAnchor: string }

const getAccountFromLocalStorage = (): LocalAccount | undefined => {
  const accountFromLS = localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY)

  const account = accountFromLS ? JSON.parse(accountFromLS) : undefined
  return account
}

export const useAccount = (accountService?: AccountService) => {
  const [account, setAccount] = React.useState<LocalAccount | undefined>(
    getAccountFromLocalStorage(),
  )

  React.useEffect(() => {
    account &&
      localStorage.setItem(ACCOUNT_LOCAL_STORAGE_KEY, JSON.stringify(account))
  }, [account])

  const createAccount = React.useCallback(
    async (account: HTTPAccountRequest) => {
      if (!accountService) {
        throw new Error("accountService is required")
      }
      const response = await accountService.create_account(account)
      if (response.status_code === 200) {
        // @ts-ignore TODO: fix types
        setAccount(response.data[0])
      }
      return response
    },
    [accountService],
  )

  const getAccount = React.useCallback(async () => {
    const account = getAccountFromLocalStorage()
    return new Promise<Account | undefined>((resolve) => resolve(account))
  }, [])

  const updateAccount = React.useCallback(
    (partialAccount: Partial<LocalAccount>) => {
      const newAccount = produce(account, (draft: LocalAccount) => ({
        ...draft,
        ...partialAccount,
      }))
      setAccount(newAccount)
    },
    [account],
  )

  const verifyPhonenumber = async (phoneNumber: string) => {
    const response = await fetch(`${CONFIG.VERIFY_PHONE_NUMBER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": window.location.origin,
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
      }),
    })

    const data = await response.json()

    const validPhonenumber =
      data.response?.MessageResponse.Result[phoneNumber].StatusCode == 200 ||
      false

    return { response: data, validPhonenumber }
  }

  React.useEffect(() => {
    // @ts-ignore TODO: fix types
    getAccount().then((account) => setAccount(account))
  }, [getAccount])

  return {
    account,
    createAccount,
    getAccount,
    updateAccount,
    verifyPhonenumber,
  }
}
