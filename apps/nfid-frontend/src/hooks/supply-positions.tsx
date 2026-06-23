import { useMemo } from "react"

import { FT } from "frontend/integration/ft/ft"
import { Category, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"
import { AAVE_SUPPORTED_CHAINS, aaveService } from "frontend/integration/aave"
import { useSWRWithTimestamp } from "@nfid/swr"
import { useEthAddress } from "./contexts"

export function useSupplyPositions(
  initedTokens?: FT[],
  viewOnlyModeAddress?: string | null,
) {
  const { ethAddress } = useEthAddress()
  const address = viewOnlyModeAddress || ethAddress

  const evmTokens = useMemo(() => {
    if (!initedTokens) return
    return initedTokens.filter(
      (t) =>
        isEvmToken(t.getChainId()) && t.getTokenCategory() !== Category.TESTNET,
    )
  }, [initedTokens])

  const { data: supportedTokens } = useSWRWithTimestamp(
    evmTokens ? "aaveSupportedTokens" : null,
    async () => {
      const tokens = await aaveService.getSupportedTokens(
        evmTokens!,
        AAVE_SUPPORTED_CHAINS,
      )
      return tokens.filter((t) => {
        const balance = t.getTokenBalance()
        return balance !== undefined && balance > BigInt(0)
      })
    },
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const { data: earnPositions, isLoading } = useSWRWithTimestamp(
    address && supportedTokens?.length
      ? viewOnlyModeAddress
        ? ["earnPositions", address]
        : "earnPositions"
      : null,
    () => {
      if (!address || !supportedTokens) return
      return aaveService.getUserPositions(
        supportedTokens,
        AAVE_SUPPORTED_CHAINS,
        address,
      )
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  )

  const totalBalance = useMemo(() => {
    return `${aaveService.getTotalUsdValue(earnPositions).value} USD`
  }, [earnPositions])

  return {
    supportedTokens,
    earnPositions,
    totalBalance,
    isLoading,
  }
}
