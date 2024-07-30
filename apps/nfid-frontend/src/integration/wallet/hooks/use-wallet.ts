import { AccountIdentifier } from "@dfinity/ledger-icp"
import { useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import useSWRImmutable from "swr/immutable"

import { getBalance } from "@nfid/integration"

import { useICPExchangeRate } from "frontend/features/fungible-token/icp/hooks/use-icp-exchange-rate"
import { getWalletPrincipal } from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"

export const useWallet = () => {
  const { profile } = useProfile()

  const { data: principal, isValidating: isWalletPrincipalLoading } =
    useSWRImmutable(
      profile?.anchor ? [profile.anchor, "walletPrincipal"] : null,
      getWalletPrincipal,
    )

  const { data: balance, isValidating: isWalletBalanceLoading } = useSWR(
    principal
      ? [
          AccountIdentifier.fromPrincipal({ principal }).toHex(),
          "walletBalance",
        ]
      : null,
    ([address]) => getBalance(address),
    {
      dedupingInterval: 30_000,
      focusThrottleInterval: 30_000,
      refreshInterval: 30_000,
    },
  )

  const { exchangeRate, isValidating: isWalletExchangeRateLoading } =
    useICPExchangeRate()

  const address = useMemo(() => {
    if (!principal) return ""
    return AccountIdentifier.fromPrincipal({ principal }).toHex()
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
    walletAddress: address,
    isWalletLoading:
      isWalletPrincipalLoading ||
      isWalletBalanceLoading ||
      isWalletExchangeRateLoading,
  }
}
