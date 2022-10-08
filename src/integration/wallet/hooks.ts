import { DelegationIdentity } from "@dfinity/identity"
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
      dedupingInterval: WALLET_SESSION_TTL_2_MIN_IN_NS / 2,
      focusThrottleInterval: WALLET_SESSION_TTL_2_MIN_IN_NS / 2,
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
    rejectTransfer?: (reason: any) => void
    executeTransfer?: (
      walletDelegation: DelegationIdentity,
      to: string,
      amount: string,
    ) => void
  } | null>(null)

  // This effect makes sure that we're resetting the queuedTransfer when
  // domain or accountId are changing
  React.useEffect(() => {
    if (
      queuedTransfer.current?.domain !== domain ||
      queuedTransfer.current?.accountId !== accountId
    ) {
      queuedTransfer.current?.rejectTransfer &&
        queuedTransfer.current.rejectTransfer(
          "domain or accountId has been changed",
        )
      queuedTransfer.current = null
    }
  }, [domain, accountId])

  // This effect calls the pending transfer when walletDelegations settles
  // and the queued parameter domain and accountId matching there current values.
  React.useEffect(() => {
    if (queuedTransfer.current) {
      const {
        amount,
        to,
        executeTransfer,
        domain: queuedDomain,
        accountId: queuedAccountId,
      } = queuedTransfer.current
      if (
        walletDelegation &&
        executeTransfer &&
        queuedDomain === domain &&
        queuedAccountId === accountId
      ) {
        executeTransfer(walletDelegation, to, amount)
        queuedTransfer.current = null
      }
    }
  }, [accountId, domain, walletDelegation])

  const handleTransfer = React.useCallback(
    async (to: string, amount: string) => {
      if (queuedTransfer.current) throw new Error("there is a pending transfer")

      return new Promise<bigint>((resolve, reject) => {
        if (!walletDelegation) {
          queuedTransfer.current = {
            to,
            amount,
            domain,
            accountId,
            rejectTransfer: reject,
            executeTransfer: (walletDelegation, to, amount) => {
              transfer(stringICPtoE8s(amount), to, walletDelegation)
                .then((value) => resolve(value))
                .catch((reason) => reject(reason))
            },
          }
        } else {
          return transfer(stringICPtoE8s(amount), to, walletDelegation)
            .then((value) => resolve(value))
            .catch((reason) => reject(reason))
        }
      })
    },
    [accountId, domain, walletDelegation],
  )

  console.debug("useTransfer", { isValidatingWalletDelegation })
  return {
    isValidatingWalletDelegation,
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
