import { Principal } from "@dfinity/principal"

import { useSWRWithTimestamp, mutate as mutateData } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TOKENS_REFRESH_INTERVAL,
} from "frontend/integration/ft/ft-service"
import {
  isTestnetToken,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import { useActorSnapshot } from "frontend/hooks/use-actor-snapshot"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { ProfileContext } from "frontend/provider"
import { useBtcAddress, useEthAddress } from "frontend/hooks"
import { useUserPrefs } from "frontend/hooks/user-prefs"

export const useTokensInit = (tokens: FT[] | undefined) => {
  const { isEthAddressLoading } = useEthAddress()
  const { isBtcAddressLoading } = useBtcAddress()
  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)
  const isMounted = useRef(false)
  const { testnetEnabled, arbitrumEnabled, baseEnabled, polygonEnabled } =
    useUserPrefs()

  const activeTokens = useMemo(
    () =>
      tokens?.filter((token) => {
        if (token.getTokenState() !== State.Active) return false
        const chainId = token.getChainId()
        if (!testnetEnabled && isTestnetToken(chainId)) return false
        if (!arbitrumEnabled && chainId === ChainId.ARB) return false
        if (!baseEnabled && chainId === ChainId.BASE) return false
        if (!polygonEnabled && chainId === ChainId.POL) return false
        return true
      }),
    [tokens, testnetEnabled, arbitrumEnabled, baseEnabled, polygonEnabled],
  )

  const [state] = useActorSnapshot(transferService)

  const addressesReady =
    isViewOnlyMode || (!isBtcAddressLoading && !isEthAddressLoading)

  const {
    data: initedTokens,
    mutate,
    isLoading,
  } = useSWRWithTimestamp(
    // TODO: do not block all the tokens if there is no eth/btc address!
    addressesReady && activeTokens && activeTokens.length > 0
      ? isViewOnlyMode
        ? ["initedTokens", viewOnlyAddress]
        : "initedTokens"
      : null,
    async () => {
      if (!activeTokens) return

      let principal: Principal
      let viewOnlyAddressOverride: string | undefined

      if (isViewOnlyMode) {
        if (viewOnlyAddressType === "icp") {
          principal = Principal.fromText(viewOnlyAddress!)
        } else {
          principal = Principal.anonymous()
          viewOnlyAddressOverride = viewOnlyAddress!
        }
      } else {
        const { publicKey } = authState.getUserIdData()
        principal = Principal.fromText(publicKey)
      }

      return ftService.getInitedTokens(
        activeTokens,
        principal,
        Boolean(isViewOnlyMode),
        viewOnlyAddressOverride,
      )
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      refreshInterval:
        state.value !== "Hidden" ? undefined : TOKENS_REFRESH_INTERVAL,
      keepPreviousData: true,
      onSuccess: () => {
        mutateData(
          isViewOnlyMode ? ["ftUsdValue", viewOnlyAddress] : "ftUsdValue",
        )
        mutateData(
          isViewOnlyMode ? ["fullUsdValue", viewOnlyAddress] : "fullUsdValue",
        )
      },
    },
  )

  useEffect(() => {
    if (!isMounted.current || !activeTokens) {
      isMounted.current = true
      return
    }
    mutate()
  }, [activeTokens])

  return { initedTokens, mutate, isLoading }
}
