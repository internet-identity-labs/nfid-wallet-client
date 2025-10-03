import { Principal } from "@dfinity/principal"

import { useEffect } from "react"
import { useSWR } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { updateCachedInitedTokens } from "frontend/features/transfer-modal/utils"

const TOKENS_REFRESH_INTERVAL = 10000

export const useTokensInit = (
  tokens: FT[] | undefined,
  isBtcAddressLoading?: boolean,
  isEthAddressLoading?: boolean,
) => {
  const {
    data: initedTokens,
    mutate,
    isLoading,
  } = useSWR(
    tokens && tokens.length > 0
      ? `initedTokens-${isBtcAddressLoading}-${isEthAddressLoading}`
      : null,
    async () => {
      if (!tokens) return

      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)
      let initedTokens = await ftService.getInitedTokens(tokens, principal)

      if (isBtcAddressLoading || isEthAddressLoading) {
        return initedTokens
      }

      const hasUninitedTokens = initedTokens.some(
        (token) =>
          (token.getTokenAddress() === BTC_NATIVE_ID ||
            token.getTokenAddress() === ETH_NATIVE_ID) &&
          !token.isInited(),
      )

      if (hasUninitedTokens) {
        initedTokens = await ftService.initializeBtcEthTokensWhenReady(
          initedTokens,
          principal,
        )
      }

      return initedTokens
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  )

  useEffect(() => {
    if (!tokens || tokens.length === 0) return

    const interval = setInterval(async () => {
      await updateCachedInitedTokens(tokens, mutate)
    }, TOKENS_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [tokens, mutate])

  return { initedTokens, mutate, isLoading }
}
