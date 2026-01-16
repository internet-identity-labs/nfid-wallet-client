import clsx from "clsx"
import { Button } from "packages/ui/src/molecules/button"
import { ModalComponent } from "@nfid-frontend/ui"
import { useEffect, useState } from "react"
import { FT } from "src/integration/ft/ft"

import { Skeleton } from "@nfid-frontend/ui"
import { useSWRWithTimestamp } from "@nfid/swr"

import {
  fetchTokens,
  filterNotActiveNotZeroBalancesTokens,
} from "frontend/features/fungible-token/utils"
import { useDarkTheme, useEthAddress } from "frontend/hooks"

import searchDarkImg from "../assets/search-dark.png"
import searchImg from "../assets/search.png"
import { TokenIdentity } from "./token-identity"
import { getUpdatedInitedTokens } from "frontend/features/transfer-modal/utils"

export function ScanTokens({
  className,
  triggerClassName,
}: {
  className?: string
  triggerClassName?: string
}) {
  const isDarkTheme = useDarkTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScanningTokens, setIsScanningTokens] = useState(true)
  const { data: allTokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })
  const [scannedTokens, setScannedTokens] = useState<Array<FT> | undefined>()
  const { ethAddress, isEthAddressLoading } = useEthAddress()

  useEffect(() => {
    if (!isModalOpen || !allTokens) return

    let cancelled = false
    setIsScanningTokens(true)
    ;(async () => {
      const tokensSnapshot = [...allTokens]

      const tokens = await filterNotActiveNotZeroBalancesTokens(
        tokensSnapshot,
        ethAddress,
        isEthAddressLoading,
      )
      if (cancelled || !tokens) return
      setScannedTokens(tokens)

      const showedTokens = await Promise.all(
        tokens.map(async (t) => {
          await t.showToken()
          return t
        }),
      )
      if (cancelled) return

      const newTokens = tokensSnapshot.map((aT) => {
        const showedToken = showedTokens.find(
          (t) =>
            t.getTokenAddress() === aT.getTokenAddress() &&
            t.getChainId() === aT.getChainId(),
        )
        return showedToken || aT
      })

      await getUpdatedInitedTokens(newTokens)
      setIsScanningTokens(false)
    })()

    return () => {
      cancelled = true
    }
  }, [isModalOpen, ethAddress, isEthAddressLoading])

  return (
    <>
      <Button
        className={triggerClassName}
        type="stroke"
        onClick={() => setIsModalOpen(true)}
      >
        Scan for new tokens
      </Button>
      <ModalComponent
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        className="p-5 w-[95%] md:w-[450px] z-[100] !rounded-[24px]"
      >
        <div className={clsx("flex flex-col dark:text-white", className)}>
          <div className="flex items-center justify-between h-[40px]">
            <p className="text-[20px] leading-[24px] mb-[20px] font-bold">
              Scan for tokens
            </p>
          </div>
          {isScanningTokens ? (
            <div className="flex flex-col grow">
              <p className="mb-[20px]">
                Looking for tokens with non-zero balances...
              </p>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  className="flex h-[40px] mb-[20px] w-full items-center"
                  key={i}
                >
                  <div className="relative">
                    <Skeleton className="rounded-[12px] h-[40px] w-[40px] mr-[10px]" />
                    <div className="flex absolute top-[calc(50%-3px)] left-[calc(50%-18px)]">
                      <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] dark:bg-zinc-700 bg-opacity-20 mr-[4px]" />
                      <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] dark:bg-zinc-700 bg-opacity-20 mr-[4px]" />
                      <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] dark:bg-zinc-700 bg-opacity-20" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Skeleton className="rounded-[4px] h-[12px] w-[100px] mb-[10px]" />
                    <Skeleton className="rounded-[4px] h-[12px] w-[60px]" />
                  </div>
                  <Skeleton className="rounded-[4px] h-[12px] w-[80px] ms-auto" />
                </div>
              ))}
              <Button
                onClick={() => setIsModalOpen(false)}
                type="stroke"
                className="w-full mt-auto dark:text-white dark:border-white"
              >
                Cancel
              </Button>
            </div>
          ) : scannedTokens?.length ? (
            <>
              <p className="mb-[20px]">
                NFID Wallet discovered new tokens with non-zero balances and
                added them to your portfolio.
              </p>
              <div
                className={clsx(
                  "overflow-auto max-h-[50vh]",
                  "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                  "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
                  "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-[#242427]",
                )}
              >
                {scannedTokens.map((token) => (
                  <div
                    key={`${token.getTokenName()}_${token.getTokenAddress()}`}
                    className="flex items-center h-[60px]"
                  >
                    <TokenIdentity token={token} />
                    <div className="ml-auto">
                      <p className="flex text-sm text-black leading-[20px] dark:text-white">
                        <span className="w-[150px] sm:w-auto truncate text-right">
                          {token.getTokenBalanceFormatted()}
                        </span>
                        &nbsp;
                        {token.getTokenSymbol()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-[20px]"
              >
                OK
              </Button>
            </>
          ) : (
            <>
              <p>No tokens with non-zero balances found.</p>
              <img
                className="h-[400px] m-auto"
                src={isDarkTheme ? searchDarkImg : searchImg}
                alt="no tokens image"
              />
              <Button onClick={() => setIsModalOpen(false)} className="w-full">
                OK
              </Button>
            </>
          )}
        </div>
      </ModalComponent>
    </>
  )
}
