import React from "react"

import { toPresentation } from "@nfid/integration/token/icp"

import ICP from "frontend/assets/dfinity.svg"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"

import { accumulateAppAccountBalance } from "../../accumulate-app-account-balances"
import { useAllDip20Token } from "../../dip-20/hooks/use-all-token-meta"
import { TokenBalanceSheet } from "../../types"
import { useICPExchangeRate } from "./use-icp-exchange-rate"
import { useUserBalances } from "./use-user-balances"

type AppAccountBalanceByToken = {
  [token: string]: TokenBalanceSheet
}

type UseBalanceICPAllReturn = {
  isLoading: boolean
  appAccountBalance?: AppAccountBalanceByToken
}

/**
 * returns map of applications and there accumulated balance across all accounts
 *
 * @param excludeEmpty only include applications with non zero balance
 */
export const useBalanceICPAll = (
  excludeEmpty: boolean = true,
): UseBalanceICPAllReturn => {
  const { applicationsMeta: applications } = useApplicationsMeta()
  const { exchangeRate, isValidating: isLoadingICPExchangeRate } =
    useICPExchangeRate()
  const { token: dip20Token } = useAllDip20Token()

  const { balances, isLoading: isLoadingBalances } = useUserBalances()
  console.debug("useUserBalances", { icpBalance: balances })

  const appAccountBalance = React.useMemo(() => {
    if (
      isLoadingICPExchangeRate ||
      isLoadingBalances ||
      !exchangeRate ||
      !balances
    ) {
      return
    }

    return {
      ICP: accumulateAppAccountBalance({
        balances,
        applications,
        exchangeRate,
        excludeEmpty,
        includeEmptyApps: ["nfid.one", "https://nns.ic0.app"],
        label: "Internet Computer",
        token: "ICP",
        icon: ICP,
        toPresentation,
      }),
      ...(dip20Token
        ? dip20Token.reduce(
            (acc, { symbol, name, logo, toPresentation }) => ({
              ...acc,
              [symbol]: accumulateAppAccountBalance({
                toPresentation,
                balances,
                applications,
                icon: logo,
                exchangeRate: symbol === "WICP" ? exchangeRate : 0,
                excludeEmpty,
                includeEmptyApps: ["nfid.one", "https://nns.ic0.app"],
                label: name,
                token: symbol,
              }),
            }),
            {},
          )
        : {}),
    }
  }, [
    isLoadingICPExchangeRate,
    isLoadingBalances,
    exchangeRate,
    balances,
    applications,
    excludeEmpty,
    dip20Token,
  ])

  console.debug("useBalanceICPAll", {
    isLoadingICPExchangeRate,
    isLoadingPrincipals: isLoadingBalances,
    exchangeRate,
    applicationsMeta: applications,
    appAccountBalance,
    balanceICPRaw: balances,
  })

  return {
    isLoading: isLoadingBalances || isLoadingICPExchangeRate,
    appAccountBalance,
  }
}
