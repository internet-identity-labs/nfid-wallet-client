import { Principal } from "@dfinity/principal"

import { useSWRWithTimestamp, mutate as mutateData } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TOKENS_REFRESH_INTERVAL,
} from "frontend/integration/ft/ft-service"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useContext, useMemo } from "react"
import { useActor } from "@xstate/react"
import { ProfileContext } from "frontend/provider"
import { useBtcAddress, useEthAddress } from "frontend/hooks"

export const useTokensInit = (tokens: FT[] | undefined) => {
  const { isEthAddressLoading } = useEthAddress()
  const { isBtcAddressLoading } = useBtcAddress()
  const activeTokens = useMemo(
    () => tokens?.filter((token) => token.getTokenState() === State.Active),
    [tokens],
  )
  const globalServices = useContext(ProfileContext)
  const [state] = useActor(globalServices.transferService)
  const addressesReady = !isBtcAddressLoading && !isEthAddressLoading

  const {
    data: initedTokens,
    mutate,
    isLoading,
  } = useSWRWithTimestamp(
    // TODO: do not block all the tokens if there is no eth/btc address!
    addressesReady && activeTokens && activeTokens.length > 0
      ? "initedTokens"
      : null,
    async () => {
      if (!activeTokens) return

      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)
      const initedTokens = await ftService.getInitedTokens(
        activeTokens,
        principal,
      )

      return initedTokens
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      refreshInterval:
        state.value !== "Hidden" ? undefined : TOKENS_REFRESH_INTERVAL,
      keepPreviousData: true,
      onSuccess: () => {
        mutateData("ftUsdValue")
        mutateData("fullUsdValue")
      },
    },
  )

  return { initedTokens, mutate, isLoading }
}
