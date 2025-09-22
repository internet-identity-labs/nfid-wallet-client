import { Principal } from "@dfinity/principal"
import useSWR from "swr"

import { authState } from "@nfid/integration"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

export const useTokensInit = (
  tokens: FT[] | undefined,
  isBtcAddressLoading?: boolean,
  isEthAddressLoading?: boolean,
) => {
  const { data: initedTokens } = useSWR(
    tokens && tokens.length > 0 ? "initedTokens" : null,
    async () => {
      if (!tokens) return

      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)

      return await Promise.all(
        tokens.map(async (token) => {
          if (
            token.getTokenAddress() === BTC_NATIVE_ID &&
            isBtcAddressLoading
          ) {
            return token
          }
          if (
            token.getTokenAddress() === ETH_NATIVE_ID &&
            isEthAddressLoading
          ) {
            return token
          }
          return await token.init(principal)
        }),
      )
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  )

  return initedTokens
}
