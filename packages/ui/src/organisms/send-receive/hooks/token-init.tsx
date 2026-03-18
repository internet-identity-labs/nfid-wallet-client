import { Principal } from "@dfinity/principal"

import { useSWRWithTimestamp, mutate as mutateData } from "@nfid/swr"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TOKENS_REFRESH_INTERVAL,
} from "frontend/integration/ft/ft-service"
import {
  ChainId,
  isEvmToken,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
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

  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)

  const [state] = useActor(transferService)

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
        mutateData("fullUsdValue")
      },
    },
  )

  return { initedTokens, mutate, isLoading }
}
