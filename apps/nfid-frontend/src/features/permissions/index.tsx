import { useMemo, useCallback, FC, useEffect, useReducer } from "react"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { NFIDTheme } from "frontend/App"
import { Permissions } from "packages/ui/src/organisms/permissions"
import { ftService, PAGE_SIZE } from "frontend/integration/ft/ft-service"
import { Principal } from "@dfinity/principal"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { authState } from "@nfid/integration"
import { fetchTokens } from "../fungible-token/utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"
import { permissionsReducer, permissionsInitialState } from "./utils"

type PermissionsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const PermissionsPage: FC<PermissionsPageProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const [state, dispatch] = useReducer(
    permissionsReducer,
    permissionsInitialState,
  )
  const publicKey = authState.getUserIdData().publicKey

  const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const { initedTokens } = useTokensInit(tokens)

  const { data: initialPage, isLoading } = useSWR(
    initedTokens ? ["allowances", 0] : null,
    () =>
      ftService.getIcrc2Allowances(
        initedTokens!,
        Principal.from(publicKey),
        0,
        PAGE_SIZE,
      ),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (initialPage) {
      dispatch({ type: "RESET", payload: { list: initialPage } })
    }
  }, [initialPage])

  const loadMore = useCallback(async () => {
    if (!state.hasMore || !initedTokens) return

    dispatch({ type: "LOAD_MORE_START" })
    try {
      const nextBatch = await ftService.getIcrc2Allowances(
        initedTokens,
        Principal.from(publicKey),
        state.page * PAGE_SIZE,
        PAGE_SIZE,
      )

      dispatch({ type: "LOAD_MORE_SUCCESS", payload: { list: nextBatch } })
    } catch (e) {
      dispatch({ type: "LOAD_MORE_SUCCESS", payload: { list: [] } })
    }
  }, [state.page, state.hasMore, publicKey, initedTokens])

  const flattenedAllowances = useMemo(() => {
    return state.allowancesList.map(({ token, allowance: a }) => {
      const amountNum = Number(a.allowance) / 10 ** token.getTokenDecimals()
      const amountStr = amountNum
        .toFixed(token.getTokenDecimals())
        .replace(TRIM_ZEROS, "")

      const usdAmount = (() => {
        if (!token) return null

        try {
          const rate = token.getTokenRate(amountStr)
          return rate
            ? rate.toFixed(token.getTokenDecimals()).replace(TRIM_ZEROS, "")
            : null
        } catch {
          return null
        }
      })()

      return {
        token,
        address: a.to_spender,
        amount: amountStr,
        amountFormatted: `${amountStr} ${token.getTokenSymbol()}`,
        usdAmount,
      }
    })
  }, [state.allowancesList])

  return (
    <ProfileTemplate
      showBackButton
      pageTitle="Permissions"
      className="dark:text-white"
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
    >
      <Permissions
        allowances={flattenedAllowances}
        isLoading={isLoading}
        loadMore={loadMore}
        isLoadingMore={state.isLoadingMore}
        hasMore={state.hasMore}
      />
    </ProfileTemplate>
  )
}

export default PermissionsPage
