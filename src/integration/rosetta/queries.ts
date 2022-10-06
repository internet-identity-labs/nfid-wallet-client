import { Principal } from "@dfinity/principal"
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
  accountName: string
  icpBalance: string
  usdBalance: string
}

interface AppBalance {
  icon?: string
  appName: string
  icpBalance: string
  accounts: AccountBalance[]
}

interface ICPBalanceSheet {
  label: string
  token: string
  icpBalance: string
  usdBalance: string
  applications: { [applicationName: string]: AppBalance | undefined }
}

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

const reduceRawToAppAccountBalance = (
  rawBalance: RawBalance[],
  applications: Application[],
  filterZeroAccount: boolean,
): ICPBalanceSheet => {
  return rawBalance.reduce<ICPBalanceSheet>(
    (acc, rawBalance) => {
      const applicationMatch = applications.find(
        (a) => a.domain === rawBalance.account.domain,
      )

      const appName = applicationMatch
        ? applicationMatch.name
        : rawBalance.account.domain

      const currentApp: AppBalance | undefined = acc.applications[appName]

      const totalBalanceValue = sumE8sICPString(
        acc.icpBalance,
        rawBalance.balance.value,
      )
      const currentAppTotalBalance = sumE8sICPString(
        acc.applications[appName]?.icpBalance || "0",
        rawBalance.balance.value,
      )

      if (filterZeroAccount && currentAppTotalBalance === "0") return acc

      return {
        ...acc,
        icpBalance: `${totalBalanceValue} ${acc.token}`,
        usdBalance: `TODO: convert ${totalBalanceValue} to USD`,
        applications: {
          ...acc.applications,
          [appName]: {
            icon: applicationMatch?.icon,
            appName: appName,
            icpBalance: `${currentAppTotalBalance} ${acc.token}`,
            accounts: [
              ...(currentApp ? currentApp.accounts : []),
              {
                accountName:
                  rawBalance.account.label ||
                  `account ${rawBalance.account.accountId}`,
                icpBalance: `${rawBalance.balance.value} ${acc.token}`,
                usdBalance: `TODO: convert to usd ${rawBalance.balance.value} USD`,
              },
            ],
          },
        },
      }
    },
    {
      label: "Internet Computer",
      token: "ICP",
      icpBalance: "0",
      usdBalance: "0",
      applications: {},
    },
  )
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

export function useBalanceICP(principal: Principal) {
  const { data: balance, ...rest } = useSWR([principal], getBalance, {
    dedupingInterval: 60_000,
    refreshInterval: 60_000,
  })

  return {
    balance,
    ...rest,
  }
}
