import { Principal } from "@dfinity/principal"

import { useSWRWithTimestamp, mutate as mutateData } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TOKENS_REFRESH_INTERVAL,
} from "frontend/integration/ft/ft-service"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useContext, useMemo, useEffect } from "react"
import { useActor } from "@xstate/react"
import { ProfileContext } from "frontend/provider"

export const useTokensInit = (
  tokens: FT[] | undefined,
  isBtcAddressLoading?: boolean,
  isEthAddressLoading?: boolean,
) => {
  const activeTokens = useMemo(
    () => tokens?.filter((token) => token.getTokenState() === State.Active),
    [tokens],
  )
  const globalServices = useContext(ProfileContext)

  const [state] = useActor(globalServices.transferService)

  const {
    data: initedTokens,
    mutate,
    isLoading,
  } = useSWRWithTimestamp(
    activeTokens && activeTokens.length > 0 ? "initedTokens" : null,
    async () => {
      if (!activeTokens) return

      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)
      let initedTokens = await ftService.getInitedTokens(
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

  const areBtcEthInited = useMemo(() => {
    const btc = initedTokens?.find((t) => t.getTokenAddress() === BTC_NATIVE_ID)
    const eth = initedTokens?.find((t) => t.getTokenAddress() === ETH_NATIVE_ID)
    return btc?.isInited() && eth?.isInited()
  }, [initedTokens])

  useEffect(() => {
    if (!initedTokens || areBtcEthInited) return

    if (!isBtcAddressLoading && !isEthAddressLoading) {
      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)

      ftService
        .initializeBtcEthTokensWhenReady(initedTokens, principal)
        .then(async () => {
          mutate(undefined, { revalidate: true })
        })
    }
  }, [
    isBtcAddressLoading,
    isEthAddressLoading,
    initedTokens,
    mutate,
    areBtcEthInited,
  ])

  return { initedTokens, mutate, isLoading }
}
