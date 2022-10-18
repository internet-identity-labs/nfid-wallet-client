import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import React from "react"
import useSWR from "swr"

import { isDefaultLabel } from "frontend/integration/identity-manager/account/utils"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

import { getBalance } from ".."
import { Account, Application } from "../../identity-manager"
import { useApplicationsMeta } from "../../identity-manager/queries"
import { useAllPrincipals } from "../../internet-identity/queries"
import { Balance } from "../rosetta_interface"
import { useICPExchangeRate } from "./use-icp-exchange-rate"

interface RawBalance {
  principalId: string
  account: Account
  balance: Balance
}

export interface AccountBalance {
  accountName: string
  icpBalance: string
  usdBalance: string
  principalId: string
  address: string
}

export interface AppBalance {
  icon?: string
  appName: string
  icpBalance: string
  accounts: AccountBalance[]
}

export interface ICPBalanceSheet {
  label: string
  token: string
  icpBalance: string
  usdBalance: string
  applications: { [applicationName: string]: AppBalance }
}

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

export const icpToUSD = (value: string, exchangeRate: number) =>
  `$${(exchangeRate * Number(value)).toFixed(2)}`

function mapApplicationBalance(
  appName: string,
  currentAppTotalBalance: string,
  token: string,
  rawBalance: RawBalance,
  icpExchangeRate: number,
  applicationMatch?: Application,
  currentApp?: AppBalance,
): AppBalance {
  return {
    icon: applicationMatch?.icon,
    appName: appName,
    icpBalance: `${currentAppTotalBalance} ${token}`,
    accounts: [
      ...(currentApp?.accounts ?? []),
      ...(Number(rawBalance.balance.value) > 0
        ? [
            {
              accountName:
                isDefaultLabel(rawBalance.account.label) ||
                !rawBalance.account.label
                  ? `account ${parseInt(rawBalance.account.accountId) + 1}`
                  : rawBalance.account.label,
              principalId: rawBalance.principalId,
              address: principalToAddress(
                // FIXME: any typecast because of Principal version mismatch in ictools
                Principal.fromText(rawBalance.principalId) as any,
              ),
              icpBalance: `${rawBalance.balance.value} ${token}`,
              usdBalance: icpToUSD(rawBalance.balance.value, icpExchangeRate),
            },
          ]
        : []),
    ].sort((a, b) => a.accountName.localeCompare(b.accountName)),
  }
}

const reduceRawToAppAccountBalance = (
  rawBalance: RawBalance[],
  applications: Application[],
  icpExchangeRate: number,
  excludeEmpty: boolean,
  includeEmptyApps: string[],
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

      const isExplicitlyIncluded =
        includeEmptyApps.includes(applicationMatch?.domain || "") ||
        includeEmptyApps.includes(applicationMatch?.domain || "")

      if (
        excludeEmpty &&
        !isExplicitlyIncluded &&
        currentAppTotalBalance === "0"
      )
        return acc

      return {
        ...acc,
        icpBalance: `${totalBalanceValue} ${acc.token}`,
        usdBalance: icpToUSD(totalBalanceValue, icpExchangeRate),
        applications: {
          ...acc.applications,
          [appName]: mapApplicationBalance(
            appName,
            currentAppTotalBalance,
            acc.token,
            rawBalance,
            icpExchangeRate,
            applicationMatch,
            currentApp,
          ),
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
  const { exchangeRate, isValidating: isLoadingICPExchangeRate } =
    useICPExchangeRate()

  const { data: balanceICPRaw, isValidating: isLoadingPrincipals } = useSWR(
    principals ? "balanceICPRaw" : null,
    async () => {
      if (!principals) throw new Error("missing req")
      return await Promise.all(
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
      !isLoadingICPExchangeRate &&
      !isLoadingPrincipals &&
      exchangeRate &&
      balanceICPRaw
        ? reduceRawToAppAccountBalance(
            balanceICPRaw,
            applicationsMeta || [],
            exchangeRate,
            excludeEmpty,
            ["nfid.one"],
          )
        : null,
    [
      isLoadingICPExchangeRate,
      isLoadingPrincipals,
      balanceICPRaw,
      applicationsMeta,
      exchangeRate,
      excludeEmpty,
    ],
  )

  console.debug("useBalanceICPAll", {
    isLoadingICPExchangeRate,
    isLoadingPrincipals,
    exchangeRate,
    applicationsMeta,
    appAccountBalance,
  })

  return {
    isLoading: isLoadingPrincipals || isLoadingICPExchangeRate,
    appAccountBalance,
  }
}
