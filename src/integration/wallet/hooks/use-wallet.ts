import { principalToAddress } from "ictool"
import { useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import useSWRImmutable from "swr/immutable"

import { getWalletPrincipal } from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { getBalance } from "frontend/integration/rosetta"
import { useICPExchangeRate } from "frontend/integration/rosetta/hooks/use-icp-exchange-rate"

import { useAllTransactions } from "./get-all-transactions"

export const useWallet = () => {
  const { profile } = useProfile()

  const { data: principal, isValidating: isWalletPrincipalLoading } =
    useSWRImmutable(
      profile?.anchor ? [profile.anchor, "walletPrincipal"] : null,
      getWalletPrincipal,
    )

  const { data: balance, isValidating: isWalletBalanceLoading } = useSWR(
    principal ? [principal, "walletBalance"] : null,
    getBalance,
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
      refreshInterval: 30_000,
    },
  )

  const { transactions, isWalletTransactionsLoading } = useAllTransactions()

  const { exchangeRate, isValidating: isWalletExchangeRateLoading } =
    useICPExchangeRate()

  const address = useMemo(() => {
    if (!principal) return ""
    return principalToAddress(principal as any)
  }, [principal])

  useEffect(() => {
    if (profile?.anchor) mutate("walletPrincipal")
  }, [profile])

  useEffect(() => {
    if (!principal) return
    mutate("walletBalance")
    mutate("walletTransactions")
  }, [principal])

  return {
    walletPrincipal: principal,
    walletBalance: balance,
    walletExchangeRate: exchangeRate,
    walletTransactions: transactions,
    walletAddress: address,
    isWalletLoading:
      isWalletPrincipalLoading ||
      isWalletBalanceLoading ||
      isWalletTransactionsLoading ||
      isWalletExchangeRateLoading,
  }
}
