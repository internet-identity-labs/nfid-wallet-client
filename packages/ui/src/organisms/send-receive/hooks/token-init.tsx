import { Principal } from "@icp-sdk/core/principal"

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
import { useContext, useEffect, useMemo, useRef } from "react"
import { useActor } from "@xstate/react"
import { ProfileContext } from "frontend/provider"
import { useBtcAddress, useEthAddress } from "frontend/hooks"
import { useUserPrefs } from "frontend/hooks/user-prefs"

export const useTokensInit = (
  tokens: FT[] | undefined,
  privateAccount?: string,
) => {
  const { isEthAddressLoading } = useEthAddress()
  const { isBtcAddressLoading } = useBtcAddress()
  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)
  const initialFetchDone = useRef(false)
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

  const [state] = useActor(transferService)

  const addressesReady =
    isViewOnlyMode ||
    Boolean(privateAccount) ||
    (!isBtcAddressLoading && !isEthAddressLoading)

  const {
    data: initedTokens,
    mutate,
    isLoading,
  } = useSWRWithTimestamp(
    // TODO: do not block all the tokens if there is no eth/btc address!
    addressesReady && activeTokens && activeTokens.length > 0
      ? isViewOnlyMode || Boolean(privateAccount)
        ? ["initedTokens", viewOnlyAddress || privateAccount]
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
      } else if (Boolean(privateAccount)) {
        principal = Principal.fromText(privateAccount!)
      } else {
        const { publicKey } = authState.getUserIdData()
        principal = Principal.fromText(publicKey)
      }

      return ftService.getInitedTokens(
        activeTokens,
        principal,
        Boolean(isViewOnlyMode) || Boolean(privateAccount),
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
          isViewOnlyMode || privateAccount
            ? ["ftUsdValue", viewOnlyAddress || privateAccount]
            : "ftUsdValue",
        )
        mutateData(
          isViewOnlyMode || privateAccount
            ? ["fullUsdValue", viewOnlyAddress || privateAccount]
            : "fullUsdValue",
        )
      },
    },
  )

  const activeTokensKey = useMemo(
    () =>
      activeTokens
        ?.map((t) => t.getTokenAddress())
        .sort()
        .join(",") ?? "",
    [activeTokens],
  )

  useEffect(() => {
    if (!activeTokens?.length) return
    if (!initialFetchDone.current) {
      initialFetchDone.current = true
      return
    }
    mutate()
  }, [activeTokensKey])

  return { initedTokens, mutate, isLoading }
}
