import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useEffect, useMemo } from "react"
import React from "react"
import useSWR, { mutate } from "swr"

import {
  getWalletDelegation,
  getWalletPrincipal,
  WALLET_SESSION_TTL_2_MIN_IN_NS,
} from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"
import {
  getBalance,
  getTransactionHistory,
  transfer,
} from "frontend/integration/rosetta"
import { useICPExchangeRate } from "frontend/integration/rosetta/queries"

import { stringICPtoE8s } from "./utils"

export const useWalletDelegation = (
  userNumber?: number,
  hostName?: string,
  personaId?: string,
) => {
  console.debug("useWalletDelegation", { userNumber })
  return useSWR(
    userNumber ? [userNumber, hostName, personaId] : null,
    (userNumber, hostName, personaId) =>
      getWalletDelegation(userNumber, hostName, personaId),
    {
      dedupingInterval: WALLET_SESSION_TTL_2_MIN_IN_NS,
      focusThrottleInterval: WALLET_SESSION_TTL_2_MIN_IN_NS,
    },
  )
}

export interface TransferAccount {
  domain?: string
  accountId?: string
}

export const useTransfer = ({ domain, accountId }: TransferAccount = {}) => {
  const { profile } = useProfile()
  const { data: walletDelegation, isValidating: isValidatingWalletDelegation } =
    useWalletDelegation(profile?.anchor, domain, accountId)

  const queuedTransfer = React.useRef<{
    to: string
    amount: string
    domain?: string
    accountId?: string
  } | null>(null)

  console.debug("useTransfer", { isValidatingWalletDelegation })
  const handleTransfer = React.useCallback(
    (to: string, amount: string) => {
      if (queuedTransfer.current) throw new Error("there is a pending transfer")

      return !walletDelegation
        ? (queuedTransfer.current = { to, amount, domain, accountId })
        : transfer(stringICPtoE8s(amount), to, walletDelegation)
    },
    [accountId, domain, walletDelegation],
  )

  React.useEffect(() => {
    if (queuedTransfer.current) {
      const {
        amount,
        to,
        domain: queuedDomain,
        accountId: queuedAccountId,
      } = queuedTransfer.current
      if (
        walletDelegation &&
        queuedDomain === domain &&
        queuedAccountId === accountId
      ) {
        queuedTransfer.current = null
        transfer(stringICPtoE8s(amount), to, walletDelegation)
      }
    }
  }, [accountId, domain, walletDelegation])

  return {
    isValidatingWalletDelegation,
    queuedTransfer,
    transfer: handleTransfer,
  }
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
