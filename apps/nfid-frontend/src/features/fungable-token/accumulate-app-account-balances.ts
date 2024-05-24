import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import {
  AppBalance,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"

import { Application, Balance } from "@nfid/integration"

import { AccountBalance } from "frontend/features/fungable-token/fetch-balances"
import { isDefaultLabel } from "frontend/integration/identity-manager/account/utils"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

export const sumE8sICPString = (a: string, b: string) => {
  return e8sICPToString(stringICPtoE8s(a) + stringICPtoE8s(b))
}

export const toUSD = (value: number, exchangeRate: number) =>
  exchangeRate !== 0 ? `${(exchangeRate * value).toFixed(2)} USD` : ``

type MapApplicationBalanceArgs = {
  toPresentation: (value?: bigint) => number
  appName: string
  currentAppTotalBalance: Balance
  token: string
  accountBalance: AccountBalance
  exchangeRate: number
  applicationMatch?: Application
  currentApp?: AppBalance
  isExplicitlyIncluded?: boolean
}

function mapApplicationBalance({
  toPresentation,
  appName,
  currentAppTotalBalance,
  token,
  accountBalance,
  exchangeRate,
  applicationMatch,
  currentApp,
  isExplicitlyIncluded,
}: MapApplicationBalanceArgs): AppBalance {
  return {
    icon: applicationMatch?.logo,
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
              address: AccountIdentifier.fromPrincipal({
                principal: Principal.fromText(accountBalance.principalId),
              }).toHex(),
              tokenBalance: accountBalance.balance[token],
              usdBalance: toUSD(
                toPresentation(accountBalance.balance[token]),
                exchangeRate,
              ),
            },
          ]
        : []),
    ].sort((a, b) => a.accountName.localeCompare(b.accountName)),
  }
}

type ReduceRawToAppAccountBalanceArgs = {
  toPresentation: (value?: bigint) => number
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
  toPresentation,
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
        address: "",
        icon: acc.icon,
        tokenBalance: totalBalanceValue,
        usdBalance: toUSD(toPresentation(totalBalanceValue), exchangeRate),
        applications: {
          ...acc.applications,
          [appName]: mapApplicationBalance({
            toPresentation,
            appName,
            currentAppTotalBalance,
            token: acc.token,
            accountBalance: rawBalance,
            exchangeRate,
            applicationMatch,
            currentApp,
            isExplicitlyIncluded,
          }),
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
      address: "",
    },
  )
}
