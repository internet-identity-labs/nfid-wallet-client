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

  React.useEffect(() => {
    getAccount().then((account) => setAccount(account))
  }, [getAccount])
  return { account, getAccount, updateAccount }
}
