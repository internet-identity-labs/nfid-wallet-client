import { useMemo, useCallback, FC, useState, useEffect } from "react"
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
import { FT } from "frontend/integration/ft/ft"
import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"

type PermissionsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const PermissionsPage: FC<PermissionsPageProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [allowancesList, setAllowancesList] = useState<
    { token: FT; allowance: AllowanceDetailDTO }[]
  >([])
  const publicKey = authState.getUserIdData().publicKey

  const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const { initedTokens } = useTokensInit(tokens)

  const { data: initialPage, isLoading } = useSWR(
    ["allowances", 0],
    () => ftService.getIcrc2Allowances(Principal.from(publicKey), 0, PAGE_SIZE),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (initialPage) {
      setAllowancesList(initialPage)
      setPage(1)
      setHasMore(initialPage.length === PAGE_SIZE)
    }
  }, [initialPage])

  const loadMore = useCallback(async () => {
    if (!hasMore) return

    setIsLoadingMore(true)
    try {
      const nextBatch = await ftService.getIcrc2Allowances(
        Principal.from(publicKey),
        page * PAGE_SIZE,
        PAGE_SIZE,
      )

      setAllowancesList((prev) => [...prev, ...nextBatch])
      setPage((p) => p + 1)

      setHasMore(nextBatch.length === PAGE_SIZE)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, publicKey])

  const flattenedAllowances = useMemo(() => {
    if (!initedTokens) return []

    return allowancesList.map(({ token, allowance: a }) => {
      const initedToken = initedTokens.find(
        (t) => t.getTokenAddress() === token.getTokenAddress(),
      )

      const amountNum = Number(a.allowance) / 10 ** token.getTokenDecimals()
      const amountStr = amountNum
        .toFixed(token.getTokenDecimals())
        .replace(TRIM_ZEROS, "")

      const usdAmount = (() => {
        if (!initedToken) return null

        try {
          const rate = initedToken.getTokenRate(amountStr)
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
  }, [allowancesList, initedTokens])

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
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
      />
    </ProfileTemplate>
  )
}

export default PermissionsPage
