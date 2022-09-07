import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"

import { useAccount } from "frontend/integration/identity-manager/queries"
import {
  getBalance,
  getExchangeRate,
  getTransactionHistory,
  getWalletDelegation,
  getWalletPrincipal,
  transfer,
} from "frontend/integration/rosetta"

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
  const { data: account } = useAccount()
  const { data: walletDelegation } = useWalletDelegation(account?.anchor)

  return useSWR(walletDelegation ? "someKey" : null, () => {
    if (!walletDelegation) throw new Error("Unreachable")

    return (to: string, amount: string) =>
      transfer(stringICPtoE8s(amount), to, walletDelegation)
  })
}

export const useWallet = () => {
  const { data: account } = useAccount()

  const { data: principal, isValidating: isWalletPrincipalLoading } = useSWR(
    "walletPrincipal",
    () => getWalletPrincipal(account?.anchor as number),
  )

  const { data: balance, isValidating: isWalletBalanceLoading } = useSWR(
    "walletBalance",
    () => getBalance(principal as Principal),
  )

  const { data: transactions, isValidating: isWalletTransactionsLoading } =
    useSWR("walletTransactions", () =>
      getTransactionHistory(principal as Principal),
    )

  const { data: exchangeRate, isValidating: isWalletExchangeRateLoading } =
    useSWR("walletExchangeRate", getExchangeRate)

  const address = useMemo(() => {
    if (!principal) return ""
    return principalToAddress(principal as any)
  }, [principal])

  useEffect(() => {
    if (account?.anchor) mutate("walletPrincipal")
  }, [account])

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
