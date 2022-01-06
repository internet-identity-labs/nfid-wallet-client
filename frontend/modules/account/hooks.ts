import { CONFIG } from "frontend/config"
import {
  Account,
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/generated/identity_manager"
import produce from "immer"
import React from "react"
import {
  validateEmail,
  validateName,
  validatePhonenumber,
  validateUniqueName,
} from "../../utils/validations"
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

  const verifyPhoneNumber = React.useCallback(async (phoneNumber: string) => {
    const domain: string = CONFIG.AWS_VERIFY_PHONENUMBER as string

    if (!domain) {
      throw new Error("No domain configured for AWS_VERIFY_PHONENUMBER")
    }

    try {
      const response = await fetch(domain, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      }).then((res) => res.json())

      return new Promise((resolve, reject) => {
        response.error && reject(response.error)

        resolve(response.data)
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  React.useEffect(() => {
    // @ts-ignore TODO: fix types
    getAccount().then((account) => setAccount(account))
  }, [getAccount])

  return { account, createAccount, getAccount, updateAccount }
}
