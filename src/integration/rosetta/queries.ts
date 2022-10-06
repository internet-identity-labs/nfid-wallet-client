import React from "react"
import useSWR from "swr"

import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/apps/identity-manager/profile/wallet/utils"

import { getBalance } from "."
import { Account, Application } from "../identity-manager"
import { useApplicationsMeta } from "../identity-manager/queries"
import { useAllPrincipals } from "../internet-identity/queries"
import { Balance } from "./rosetta_interface"

interface RawBalance {
  principalId: string
  account: Account
  balance: Balance
}

interface AccountBalance {
  accountId: string
  balance: Balance
}

interface AppBalance {
  totalBalance: Balance
  accounts: AccountBalance[]
}

interface AppAccountBalanceRecords {
  [applicationName: string]: AppBalance | undefined
}

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

const reduceRawToAppAccountBalance = (
  rawBalance: RawBalance[],
  applications: Application[],
  filterZeroAccount: boolean,
): AppAccountBalanceRecords => {
  return rawBalance.reduce<AppAccountBalanceRecords>((acc, rawBalance) => {
    const applicationMatch = applications.find(
      (a) => a.domain === rawBalance.account.domain,
    )

    const appName = applicationMatch
      ? applicationMatch.name
      : rawBalance.account.domain

    const currentApp: AppBalance | undefined = acc[appName]

    const totalBalanceValue = sumE8sICPString(
      currentApp?.totalBalance?.value || "0",
      rawBalance.balance.value,
    )

    if (filterZeroAccount && totalBalanceValue === "0") return acc

    return {
      ...acc,
      [appName]: {
        totalBalance: {
          ...rawBalance.balance,
          value: totalBalanceValue,
        } as Balance,
        accounts: [
          ...(currentApp ? currentApp.accounts : []),
          {
            accountId: rawBalance.account.accountId,
            balance: rawBalance.balance,
          },
        ],
      },
    }
  }, {})
}

/**
 * returns map of applications and there accumulated balance across all accounts
 *
 * @param excludeEmpty only include applications with non zero balance
 */
export const useBalanceICPAll = (excludeEmpty: boolean = true) => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()

  const { data: balanceICPRaw, isValidating: isLoading } = useSWR(
    principals ? "balanceICPAll" : null,
    async () => {
      if (!principals) throw new Error("principals required")

      return Promise.all(
        principals.map(async ({ principal, account }) => ({
          principalId: principal.toText(),
          account,
          balance: await getBalance(principal),
        })),
      )
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  const appAccountBalance = React.useMemo(
    () =>
      balanceICPRaw
        ? reduceRawToAppAccountBalance(
            balanceICPRaw,
            applicationsMeta || [],
            excludeEmpty,
          )
        : null,
    [balanceICPRaw, applicationsMeta],
  )

  return { isLoading, appAccountBalance }
}
