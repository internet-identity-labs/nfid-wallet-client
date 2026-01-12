import {
  useMemo,
  useCallback,
  FC,
  useEffect,
  useReducer,
  useState,
} from "react"
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
import { useIdentity } from "frontend/hooks/identity"
import { Button } from "@nfid-frontend/ui"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { Spinner } from "packages/ui/src/atoms/spinner"

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
  const { identity, isLoading: identityLoading } = useIdentity()
  const publicKey = authState.getUserIdData().publicKey
  const [isLoadingRevoke, setIsLoadingRevoke] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })
  const { initedTokens } = useTokensInit(tokens)

  const revokeAll = async () => {
    try {
      if (!identity) return
      setIsLoadingRevoke(true)

      await ftService.revokeAllAllowances(identity, state.allowancesList)

      dispatch({
        type: "RESET",
        payload: { list: [] },
      })
      toaster.success("All token approvals have been successfully revoked")
    } catch (e) {
      toaster.error(`Revoke error. ${(e as Error).message}`)
    } finally {
      setIsLoadingRevoke(false)
      setIsModalOpen(false)
    }
  }

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
    } catch (_e) {
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
      headerMenu={
        flattenedAllowances.length === 0 ? null : (
          <Button
            disabled={
              state.isLoadingMore ||
              isLoadingRevoke ||
              flattenedAllowances.length === 0
            }
            className="ml-auto"
            onClick={() => setIsModalOpen(true)}
            type="stroke"
            isSmall
          >
            {isLoadingRevoke ? "Loading..." : "Revoke all"}
          </Button>
        )
      }
    >
      <Permissions
        allowances={flattenedAllowances}
        isLoading={isLoading}
        loadMore={loadMore}
        isLoadingMore={state.isLoadingMore}
        hasMore={state.hasMore}
        identity={identity}
        identityLoading={identityLoading}
        dispatch={dispatch}
      />
      <ModalComponent
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
      >
        <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-[18px]">
          Revoke all approvals
        </p>
        <p className="leading-[22px] dark:text-white">
          You are about to revoke all token approvals previously granted to
          other services.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button
            type="stroke"
            isSmall
            className="w-[115px]"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>

          <Button
            isSmall
            className="w-[115px]"
            onClick={revokeAll}
            disabled={identityLoading || !identity || isLoadingRevoke}
            icon={isLoadingRevoke ? <Spinner /> : null}
          >
            Revoke
          </Button>
        </div>
      </ModalComponent>
    </ProfileTemplate>
  )
}

export default PermissionsPage
