import { useMemo } from "react"

import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"

import { mapAccountBalancesToOptions } from "../utils/map-balances-to-options"

export const useWalletOptions = (selectedToken: string) => {
  const { wallets } = useAllWallets()
  const { rates } = useExchangeRates(["ICP", "BTC", "ETH"])

  const walletOptions = useMemo(() => {
    return mapAccountBalancesToOptions(wallets, selectedToken, rates)
  }, [rates, selectedToken, wallets])

  return { walletOptions }
}
