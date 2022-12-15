import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import React from "react"
import useSWR from "swr"

import { Account, Application, Balance, getBalance } from "@nfid/integration"
import { toPresentation } from "@nfid/integration/token/icp"

import { isDefaultLabel } from "frontend/integration/identity-manager/account/utils"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

import { useApplicationsMeta } from "../../identity-manager/queries"
import { useAllPrincipals } from "../../internet-identity/queries"
import { useICPExchangeRate } from "./use-icp-exchange-rate"

interface RawBalance {
  principalId: string
  account: Account
  balance: Balance
}

export interface AccountBalance {
  accountName: string
  tokenBalance: Balance
  usdBalance: string
  principalId: string
  address: string
}

export interface AppBalance {
  icon?: string
  appName: string
  tokenBalance: Balance
  accounts: AccountBalance[]
}

export interface TokenBalanceSheet {
  label: string
  token: string
  tokenBalance: Balance
  usdBalance: string
  applications: { [applicationName: string]: AppBalance }
}

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

export const icpToUSD = (value: number, exchangeRate: number) =>
  `$${(exchangeRate * value).toFixed(2)}`

function mapApplicationBalance(
  appName: string,
  currentAppTotalBalance: Balance,
  token: string,
  rawBalance: RawBalance,
  icpExchangeRate: number,
  applicationMatch?: Application,
  currentApp?: AppBalance,
  isExplicitlyIncluded?: boolean,
): AppBalance {
  return {
    icon: applicationMatch?.icon,
    appName: appName,
    tokenBalance: currentAppTotalBalance,
    accounts: [
      ...(currentApp?.accounts ?? []),
      ...(rawBalance.balance > 0 || isExplicitlyIncluded
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
              tokenBalance: rawBalance.balance,
              usdBalance: icpToUSD(
                toPresentation(rawBalance.balance),
                icpExchangeRate,
              ),
            },
          ]
        : []),
    ].sort((a, b) => a.accountName.localeCompare(b.accountName)),
  }
}

/**
 * Returns the balance sheet for all applications and their accounts
 *
 * @param rawBalance - balance of a single account
 * @param applications - list of applications from identity manager
 * @param exchangeRate - exchange rate of Token to USD
 * @param excludeEmpty - if true, exclude applications with no balance
 * @param includeEmptyApps - include apps with given appName or domain even if their balance is 0
 */
const reduceRawToAppAccountBalance = (
  rawBalance: RawBalance[],
  applications: Application[],
  exchangeRate: number,
  excludeEmpty: boolean,
  includeEmptyApps: string[],
): TokenBalanceSheet => {
  return rawBalance.reduce<TokenBalanceSheet>(
    (acc, rawBalance) => {
      const applicationMatch: Application | undefined = applications.find(
        (a) => a.domain === rawBalance.account.domain,
      )

      const appName = applicationMatch
        ? applicationMatch.name
        : rawBalance.account.domain

      const currentApp: AppBalance | undefined = acc.applications[appName]

      const totalBalanceValue = acc.tokenBalance + rawBalance.balance

      const currentAppTotalBalance =
        acc.applications[appName]?.tokenBalance ||
        BigInt(0) + rawBalance.balance

      const isExplicitlyIncluded =
        includeEmptyApps.includes(applicationMatch?.domain || "") ||
        includeEmptyApps.includes(applicationMatch?.name || "")

      if (
        excludeEmpty &&
        !isExplicitlyIncluded &&
        currentAppTotalBalance === BigInt(0)
      )
        return acc

      return {
        ...acc,
        tokenBalance: totalBalanceValue,
        usdBalance: icpToUSD(toPresentation(totalBalanceValue), exchangeRate),
        applications: {
          ...acc.applications,
          [appName]: mapApplicationBalance(
            appName,
            currentAppTotalBalance,
            acc.token,
            rawBalance,
            exchangeRate,
            applicationMatch,
            currentApp,
            isExplicitlyIncluded,
          ),
        },
      }
    },
    {
      label: "Internet Computer",
      token: "ICP",
      tokenBalance: BigInt(0),
      usdBalance: "0",
      applications: {},
    },
  )
}

type UseUserBalancesArgs = {
  token: string
  getBalance: (principalId: string) => Promise<Balance>
}

export const useUserBalances = ({ token, getBalance }: UseUserBalancesArgs) => {
  const { principals } = useAllPrincipals()

  const { data: balances, isValidating: isLoadingPrincipals } = useSWR(
    principals ? [principals, `${token}BalanceRaw`] : null,
    async ([principals]) => {
      return await Promise.all(
        principals.map(async ({ principal, account }) => ({
          principalId: principal.toText(),
          account,
          balance: await getBalance(principal.toText()),
        })),
      )
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoadingPrincipals }
}

/**
 * returns map of applications and there accumulated balance across all accounts
 *
 * @param excludeEmpty only include applications with non zero balance
 */
export const useBalanceICPAll = (excludeEmpty: boolean = true) => {
  const { applicationsMeta } = useApplicationsMeta()
  const { exchangeRate, isValidating: isLoadingICPExchangeRate } =
    useICPExchangeRate()

  const { balances: icpBalance, isLoadingPrincipals } = useUserBalances({
    token: "ICP",
    getBalance: (principalId) =>
      getBalance(principalToAddress(Principal.fromText(principalId))),
  })

  const appAccountBalance = React.useMemo(
    () =>
      !isLoadingICPExchangeRate &&
      !isLoadingPrincipals &&
      exchangeRate &&
      icpBalance
        ? reduceRawToAppAccountBalance(
            icpBalance,
            applicationsMeta || [],
            exchangeRate,
            excludeEmpty,
            ["nfid.one", "https://nns.ic0.app"],
          )
        : null,
    [
      isLoadingICPExchangeRate,
      isLoadingPrincipals,
      icpBalance,
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
    balanceICPRaw: icpBalance,
  })

  return {
    isLoading: isLoadingPrincipals || isLoadingICPExchangeRate,
    appAccountBalance,
  }
}
