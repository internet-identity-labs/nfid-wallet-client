import { useMemo } from "react"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"

import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"

import { mapAccountBalancesToOptions } from "../utils/map-balances-to-options"

export const useWalletOptions = (selectedToken: string) => {
  const { wallets } = useAllWallets()
  const { rates } = useExchangeRates()
  const { erc20 } = useErc20()

  const walletOptions = useMemo(() => {
    return mapAccountBalancesToOptions(
      wallets,
      selectedToken,
      rates,
      erc20 ?? [],
    )
  }, [rates, selectedToken, wallets, erc20])

  return { walletOptions }
}
