import { Principal } from "@dfinity/principal"

import { useSWRWithTimestamp, mutate as mutateData } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TOKENS_REFRESH_INTERVAL,
} from "frontend/integration/ft/ft-service"
import {
  isNonIcrc1Token,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
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

  const areNativeInited = useMemo(() => {
    if (!initedTokens) return false

    const nonIcrc1Tokens = initedTokens.filter((t) =>
      isNonIcrc1Token(t.getChainId()),
    )

    return nonIcrc1Tokens.every((token) => token?.isInited())
  }, [initedTokens])

  useEffect(() => {
    if (!initedTokens || areNativeInited) return

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
    areNativeInited,
  ])

  return { initedTokens, mutate, isLoading }
}
