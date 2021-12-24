import { CONFIG } from "frontend/config"
import produce from "immer"
import React from "react"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"
import { Account } from "./types"

const getAccountFromLocalStorage = (): Account | null => {
  const accountFromLS = localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY)

  const account: Account = accountFromLS ? JSON.parse(accountFromLS) : null
  return account
}

export const useAccount = () => {
  const [account, setAccount] = React.useState<Account | null>(
    getAccountFromLocalStorage(),
  )

  React.useEffect(() => {
    account &&
      localStorage.setItem(ACCOUNT_LOCAL_STORAGE_KEY, JSON.stringify(account))
  }, [account])

  const getAccount = React.useCallback(async () => {
    const account = getAccountFromLocalStorage()
    return new Promise<Account | null>((resolve) => resolve(account))
  }, [])

  const updateAccount = React.useCallback(
    (partialAccount: Partial<Account>) => {
      const newAccount = produce(account, (draft: Account) => ({
        ...draft,
        ...partialAccount,
      }))
      setAccount(newAccount)
    },
    [account],
  )

  const verifyPhoneNumber = React.useCallback(
    async (phoneNumber?: string) => {
      const domain: string = CONFIG.AWS_VERIFY_PHONENUMBER as string

      const response = await fetch(domain, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber ?? account?.phoneNumber.value,
        }),
      })

      return new Promise<boolean>((resolve) => resolve(response.ok))
    },
    [account?.phoneNumber.value],
  )

  verifyPhoneNumber();

  React.useEffect(() => {
    getAccount().then((account) => setAccount(account))
  }, [getAccount])

  return { account, getAccount, updateAccount, verifyPhoneNumber }
}
