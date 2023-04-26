import { useMemo } from "react"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"
import { useErc20Polygon } from "src/features/fungable-token/erc-20/hooks/use-erc-20-polygon"

import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"

import { mapAccountBalancesToOptions } from "../utils/map-balances-to-options"

export const useWalletOptions = (selectedToken: string) => {
  const { wallets } = useAllWallets()
  const { rates } = useExchangeRates()
  const { erc20 } = useErc20()
  const { erc20: erc20Polygon } = useErc20Polygon()

  const walletOptions = useMemo(() => {
    return mapAccountBalancesToOptions(
      wallets,
      selectedToken,
      rates,
      erc20 ?? [],
      erc20Polygon ?? [],
    )
  }, [rates, selectedToken, wallets, erc20, erc20Polygon])

  return { walletOptions }
}
