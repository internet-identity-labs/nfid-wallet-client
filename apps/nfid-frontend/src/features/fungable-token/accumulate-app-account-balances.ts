import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import { Application, Balance } from "@nfid/integration"
import { AccountBalance } from "@nfid/integration/token/fetch-balances"
import { toPresentation } from "@nfid/integration/token/icp"

import { isDefaultLabel } from "frontend/integration/identity-manager/account/utils"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

import { AppBalance, TokenBalanceSheet } from "./types"

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

export const icpToUSD = (value: number, exchangeRate: number) =>
  `$${(exchangeRate * value).toFixed(2)}`

function mapApplicationBalance(
  appName: string,
  currentAppTotalBalance: Balance,
  token: string,
  accountBalance: AccountBalance,
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
      ...(accountBalance.balance[token] > 0 || isExplicitlyIncluded
        ? [
            {
              accountName:
                isDefaultLabel(accountBalance.account.label) ||
                !accountBalance.account.label
                  ? `account ${parseInt(accountBalance.account.accountId) + 1}`
                  : accountBalance.account.label,
              principalId: accountBalance.principalId,
              address: principalToAddress(
                // FIXME: any typecast because of Principal version mismatch in ictools
                Principal.fromText(accountBalance.principalId) as any,
              ),
              tokenBalance: accountBalance.balance[token],
              usdBalance: icpToUSD(
                toPresentation(accountBalance.balance[token]),
                icpExchangeRate,
              ),
            },
          ]
        : []),
    ].sort((a, b) => a.accountName.localeCompare(b.accountName)),
  }
}

type ReduceRawToAppAccountBalanceArgs = {
  balances: AccountBalance[]
  applications?: Application[]
  exchangeRate: number
  excludeEmpty: boolean
  includeEmptyApps: string[]
  label: string
  token: string
  icon: string
}
/**
 * Returns the balance sheet for all applications and their accounts
 *
 * @param balances - balance of a single account
 * @param applications - list of applications from identity manager
 * @param exchangeRate - exchange rate of Token to USD
 * @param excludeEmpty - if true, exclude applications with no balance
 * @param includeEmptyApps - include apps with given appName or domain even if their balance is 0
 */
export const accumulateAppAccountBalance = ({
  balances,
  applications = [],
  exchangeRate,
  excludeEmpty,
  includeEmptyApps,
  label,
  token,
  icon,
}: ReduceRawToAppAccountBalanceArgs): TokenBalanceSheet => {
  return balances.reduce<TokenBalanceSheet>(
    (acc, rawBalance) => {
      const applicationMatch: Application | undefined = applications.find(
        (a) => a.domain === rawBalance.account.domain,
      )

      const appName = applicationMatch
        ? applicationMatch.name
        : rawBalance.account.domain

      const currentApp: AppBalance | undefined = acc.applications[appName]

      const totalBalanceValue = acc.tokenBalance + rawBalance.balance[acc.token]

      const currentAppTotalBalance =
        (acc.applications[appName]?.tokenBalance || BigInt(0)) +
        rawBalance.balance[acc.token]

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
        icon: acc.icon,
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
      label,
      token,
      icon,
      tokenBalance: BigInt(0),
      usdBalance: "0",
      applications: {},
    },
  )
}
