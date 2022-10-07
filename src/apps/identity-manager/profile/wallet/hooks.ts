import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"

import {
  getWalletDelegation,
  getWalletPrincipal,
} from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"
import {
  getBalance,
  getTransactionHistory,
  transfer,
} from "frontend/integration/rosetta"
import { useICPExchangeRate } from "frontend/integration/rosetta/queries"

import { stringICPtoE8s } from "./utils"

export const useWalletDelegation = (userNumber?: number) => {
  return useSWR(
    userNumber ? "walletDelegation" : null,
    () => {
      if (!userNumber) throw new Error("Unreachable")
      return getWalletDelegation(userNumber)
    },
    { dedupingInterval: 90 },
  )
}

export const useTransfer = () => {
  const { profile } = useProfile()
  const { data: walletDelegation } = useWalletDelegation(profile?.anchor)

  return useSWR(walletDelegation ? "someKey" : null, () => {
    if (!walletDelegation) throw new Error("Unreachable")

    return (to: string, amount: string) =>
      transfer(stringICPtoE8s(amount), to, walletDelegation)
  })
}

export const useWallet = () => {
  const { profile } = useProfile()

  const { data: principal, isValidating: isWalletPrincipalLoading } = useSWR(
    "walletPrincipal",
    () => getWalletPrincipal(profile?.anchor as number),
  )

  const { data: balance, isValidating: isWalletBalanceLoading } = useSWR(
    "walletBalance",
    () => getBalance(principal as Principal),
  )

  const { data: transactions, isValidating: isWalletTransactionsLoading } =
    useSWR("walletTransactions", () =>
      getTransactionHistory(principal as Principal),
    )

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
