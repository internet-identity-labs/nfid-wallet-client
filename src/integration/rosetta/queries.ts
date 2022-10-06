import React from "react"
import useSWR from "swr"

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

export const sumDecimalValue = (
  a: { value: string; decimals: number },
  b: { value: string; decimals: number },
) => {
  if (a.decimals !== b.decimals) throw new Error("decimals must match")
  const multiplier = Math.pow(10, a.decimals)
  return `${
    (multiplier * parseFloat(a.value) + multiplier * parseFloat(b.value)) /
    multiplier
  }`
}

const reduceRawToAppAccountBalance = (
  rawBalance: RawBalance[],
  applications: Application[],
  filterZeroAccount: boolean,
): AppAccountBalanceRecords => {
  const commonFields = {
    currency: {
      symbol: "ICP",
      decimals: 8,
      metadata: {
        Issuer: "",
      },
    },
    metadata: {},
  }
  const appAccountBalance = {
    "Application 1": {
      totalBalance: {
        value: "0.0003",
        ...commonFields,
      },
      accounts: [
        {
          accountId: "0",
          balance: {
            value: "0.0001",
            ...commonFields,
          },
        },
        {
          accountId: "1",
          balance: {
            value: "0.0002",
            ...commonFields,
          },
        },
      ],
    },
  }
  // return appAccountBalance
  return rawBalance.reduce<AppAccountBalanceRecords>((acc, rawBalance) => {
    const applicationMatch = applications.find(
      (a) => a.domain === rawBalance.account.domain,
    )

    const appName = applicationMatch
      ? applicationMatch.name
      : rawBalance.account.domain

    const currentApp: AppBalance | undefined = acc[appName]

    const totalBalanceValue = sumDecimalValue(
      {
        value: currentApp?.totalBalance?.value || "0",
        decimals:
          currentApp?.totalBalance?.currency?.decimals ||
          rawBalance.balance.currency.decimals,
      },
      {
        value: rawBalance.balance.value,
        decimals: rawBalance.balance.currency.decimals,
      },
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
 * @param filterZeroAccount only include applications with non zero balance
 */
export const useBalanceICPAll = (filterZeroAccount: boolean = true) => {
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
  )

  const appAccountBalance = React.useMemo(
    () =>
      balanceICPRaw
        ? reduceRawToAppAccountBalance(
            balanceICPRaw,
            applicationsMeta || [],
            filterZeroAccount,
          )
        : null,
    [balanceICPRaw, applicationsMeta],
  )

  return { isLoading, balanceICPRaw, appAccountBalance }
}
