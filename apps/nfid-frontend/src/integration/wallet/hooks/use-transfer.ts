import { DelegationIdentity } from "@dfinity/identity"

import React from "react"

import { transfer as transferICP } from "@nfid/integration/token/icp"

import { useProfile } from "frontend/integration/identity-manager/queries"

import { useWalletDelegation } from "./use-wallet-delegation"

import { TokenTransferConfig } from "."

interface Transfer {
  to: string
  amount: string
  delegationIdentity: DelegationIdentity
  canisterId?: string
  memo?: bigint
  transformAmount: (amount: string) => number
}

const handleTokenTransfer = async ({
  to,
  amount,
  memo,
  delegationIdentity,
  transformAmount,
}: Transfer) => {
  return await transferICP({
    amount: transformAmount(amount),
    to,
    memo,
    identity: delegationIdentity,
  })
}

export const useTransfer = ({
  domain,
  accountId,
  memo,
  tokenCanisterId,
  transformAmount,
}: TokenTransferConfig) => {
  const { profile } = useProfile()
  const { data: walletDelegation, isValidating: isValidatingWalletDelegation } =
    useWalletDelegation(profile?.anchor, domain, accountId)

  const queuedTransfer = React.useRef<{
    to: string
    amount: string
    memo?: bigint
    domain?: string
    accountId?: string
    rejectTransfer?: (reason: any) => void
    executeTransfer?: (
      walletDelegation: DelegationIdentity,
      to: string,
      amount: string,
      memo?: bigint,
    ) => void
  } | null>(null)

  // This effect makes sure that we're resetting the queuedTransfer when
  // domain or accountId are changing
  React.useEffect(() => {
    if (
      queuedTransfer.current?.domain !== domain ||
      queuedTransfer.current?.accountId !== accountId
    ) {
      queuedTransfer.current?.rejectTransfer?.(
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
  }, [accountId, memo, domain, walletDelegation])

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
              handleTokenTransfer({
                amount,
                to,
                delegationIdentity: walletDelegation,
                canisterId: tokenCanisterId,
                memo,
                transformAmount,
              })
                .then((value) => resolve(value))
                .catch((reason) => reject(reason))
            },
          }
        } else {
          return handleTokenTransfer({
            amount,
            to,
            memo,
            delegationIdentity: walletDelegation,
            canisterId: tokenCanisterId,
            transformAmount,
          })
            .then((value) => resolve(value))
            .catch((reason) => reject(reason))
        }
      })
    },
    [
      accountId,
      domain,
      memo,
      tokenCanisterId,
      transformAmount,
      walletDelegation,
    ],
  )

  console.debug("useTransfer", { isValidatingWalletDelegation })
  return {
    isValidatingWalletDelegation,
    transfer: handleTransfer,
  }
}
