import { CONFIG } from "frontend/config"
import produce from "immer"
import React from "react"
import {
  validateEmail,
  validateName,
  validatePhonenumber,
  validateUniqueName,
} from "./../validations"
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
    return account
  }, [])

  const createAccount = React.useCallback(
    async (record: Omit<Account, "principalId">, token: string) => {
      try {
        if (!validateName(record.name)) {
          throw new Error("Invalid name")
        } else if (!validateUniqueName(account, record.name)) {
          throw new Error("Account name is already taken")
        } else if (!validateEmail(record.email?.value as string)) {
          throw new Error("Invalid email")
        } else if (!validatePhonenumber(record.phoneNumber.value)) {
          throw new Error("Invalid phone number")
        }

        const newAccount = produce(account, (draft: Account) => {
          draft.name = record.name
          draft.phoneNumber = record.phoneNumber
          draft.email = record.email
        })

        setAccount(newAccount)
      } catch (error) {
        console.error(error)
      }
    },
    [account],
  )

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

  const verifyPhoneNumber = React.useCallback(async (phoneNumber: string) => {
    const domain: string = CONFIG.AWS_VERIFY_PHONENUMBER as string

    if (!domain) {
      throw new Error("No domain configured for AWS_VERIFY_PHONENUMBER")
    }

    const response = await fetch(domain, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
      }),
    })

    return new Promise<boolean>((resolve) => resolve(response.ok))
  }, [])

  React.useEffect(() => {
    getAccount().then((account) => setAccount(account))
  }, [getAccount])

  return {
    account,
    getAccount,
    createAccount,
    updateAccount,
    verifyPhoneNumber,
  }
}
