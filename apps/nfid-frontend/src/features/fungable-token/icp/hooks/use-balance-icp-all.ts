import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import React from "react"

import { toPresentation } from "@nfid/integration/token/utils"

import ICP from "frontend/assets/dfinity.svg"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { AssetFilter } from "frontend/ui/connnector/types"

import { accumulateAppAccountBalance } from "../../accumulate-app-account-balances"
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
  assetFilters?: AssetFilter[],
): UseBalanceICPAllReturn => {
  const { applicationsMeta: applications } = useApplicationsMeta()
  const { exchangeRate, isValidating: isLoadingICPExchangeRate } =
    useICPExchangeRate()

  const { balances, isLoading: isLoadingBalances } = useUserBalances()

  console.debug("useUserBalances", { icpBalance: balances, rate: exchangeRate })

  const appAccountBalance = React.useMemo(() => {
    if (isLoadingBalances || !balances) {
      return
    }

    return {
      ICP: accumulateAppAccountBalance({
        balances: assetFilters?.length
          ? balances.filter((b) =>
              assetFilters?.find((f) => f.principal === b.principal.toString()),
            )
          : balances,
        applications,
        exchangeRate: exchangeRate ?? 0,
        excludeEmpty,
        includeEmptyApps: ["nfid.one", "https://nns.ic0.app"],
        label: "Internet Computer",
        token: "ICP",
        icon: ICP,
        toPresentation,
      }),
    }
  }, [
    isLoadingBalances,
    exchangeRate,
    balances,
    assetFilters,
    applications,
    excludeEmpty,
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
    isLoading:
      isLoadingBalances ||
      !appAccountBalance ||
      Object.values(appAccountBalance.ICP.applications).length === 0,
    appAccountBalance,
  }
}
