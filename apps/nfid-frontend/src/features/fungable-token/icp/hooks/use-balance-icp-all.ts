import { principalToAddress } from "ictool"
import React from "react"
import useSWR from "swr"

import { getBalance } from "@nfid/integration"
import { getBalance as getDip20Balance } from "@nfid/integration/token/dip-20"

import ICP from "frontend/assets/dfinity.svg"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

import { useAllTokenMeta } from "../../dip-20/hooks/use-all-token-meta"
import { accumulateAppAccountBalance } from "../../reduce-to-app-account-balance"
import { RawBalance, TokenBalanceSheet } from "../../types"
import { useICPExchangeRate } from "./use-icp-exchange-rate"

export const useUserBalances = () => {
  const { principals } = useAllPrincipals()
  const { token: dip20Token } = useAllTokenMeta()
  console.debug("useUserBalances", { dip20Token })

  const { data: balances, isValidating: isLoadingPrincipals } = useSWR(
    dip20Token && principals ? [principals, dip20Token, `AllBalanceRaw`] : null,
    async ([principals, dip20Token]): Promise<RawBalance[]> => {
      console.debug("AllBalanceRaw", { principals, dip20Token })
      return await Promise.all(
        principals.map(async ({ principal, account }) => {
          const ICP = await getBalance(principalToAddress(principal))
          const DIP20 = await dip20Token.reduce(
            async (acc, { symbol, canisterId }) => ({
              ...(await acc),
              [symbol]: await getDip20Balance({
                canisterId,
                principalId: principal.toText(),
              }),
            }),
            Promise.resolve({}),
          )
          return {
            principalId: principal.toText(),
            account,
            balance: {
              ICP,
              ...DIP20,
            },
          }
        }),
      )
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { balances: balances, isLoadingPrincipals }
}

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
  const { token: dip20Token } = useAllTokenMeta()

  const { balances, isLoadingPrincipals } = useUserBalances()
  console.debug("useUserBalances", { icpBalance: balances })

  const appAccountBalance = React.useMemo(() => {
    if (
      isLoadingICPExchangeRate ||
      isLoadingPrincipals ||
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
      }),
      ...(dip20Token
        ? dip20Token.reduce(
            (acc, { symbol, name, logo }) => ({
              ...acc,
              [symbol]: accumulateAppAccountBalance({
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
    isLoadingPrincipals,
    exchangeRate,
    balances,
    applications,
    excludeEmpty,
    dip20Token,
  ])

  console.debug("useBalanceICPAll", {
    isLoadingICPExchangeRate,
    isLoadingPrincipals,
    exchangeRate,
    applicationsMeta: applications,
    appAccountBalance,
    balanceICPRaw: balances,
  })

  return {
    isLoading: isLoadingPrincipals || isLoadingICPExchangeRate,
    appAccountBalance,
  }
}
