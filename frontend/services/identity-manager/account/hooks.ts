import { CONFIG } from "frontend/config"
import {
  AccountResponse,
  HTTPAccountRequest,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/services/identity-manager/identity_manager"
import produce from "immer"
import { useAtom } from "jotai"

import React from "react"
import { accountAtom, LocalAccount, userNumberAtom } from "./state"

type AccountService = Pick<
  _IDENTITY_MANAGER_SERVICE,
  "create_account" | "update_account" | "get_account"
>

export const useAccount = (accountService?: AccountService) => {
  const [account, setAccount] = useAtom(accountAtom)
  const [userNumber] = useAtom(userNumberAtom)

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
    [accountService, setAccount],
  )

  const getAccount = React.useCallback(async () => {
    return new Promise<AccountResponse | undefined>((resolve) =>
      resolve(account || undefined),
    )
  }, [account])

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

    const validPhonenumber =
      data.response?.MessageResponse.Result[phoneNumber].StatusCode === 200

    return { response: data, validPhonenumber }
  }

  return {
    account,
    userNumber,
    createAccount,
    getAccount,
    updateAccount,
    verifyPhonenumber,
  }
}
