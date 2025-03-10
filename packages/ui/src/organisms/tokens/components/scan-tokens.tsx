import clsx from "clsx"
import { Button } from "packages/ui/src/molecules/button"
import {
  filterNotActiveNotZeroBalancesTokens,
  fetchTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import { FT } from "src/integration/ft/ft"

import { ImageWithFallback, IconNftPlaceholder } from "@nfid-frontend/ui"
import { Skeleton } from "@nfid-frontend/ui"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import searchImg from "./search.png"

export function ScanTokens({
  onCancel,
  onScanned,
  className,
}: {
  onCancel: () => unknown
  onScanned: () => unknown
  className?: string
}) {
  const [isScanningTokens, setIsScanningTokens] = useState(true)
  const { data: allTokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })
  const [scannedTokens, setScannedTokens] = useState<Array<FT> | undefined>()

  useEffect(() => {
    if (allTokens && !scannedTokens) {
      filterNotActiveNotZeroBalancesTokens(allTokens).then((tokens) => {
        setScannedTokens(tokens)
        Promise.all(
          tokens.map(async (t) => {
            await t.showToken()
            return t
          }),
        )
          .then((showedTokens) => {
            const newTokens = allTokens.map((aT) => {
              const showedToken = showedTokens.find(
                (t) => t.getTokenAddress() === aT.getTokenAddress(),
              )
              return showedToken || aT
            })
            mutateWithTimestamp("tokens", newTokens, false)
          })
          .finally(() => {
            setIsScanningTokens(false)
          })
      })
    }
  }, [allTokens, scannedTokens])

  return (
    <div className={clsx("flex flex-col", className)}>
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
                  <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] bg-opacity-20 mr-[4px]" />
                  <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] bg-opacity-20 mr-[4px]" />
                  <div className="h-[6px] w-[6px] rounded-[1.5px] bg-[#D2D2D2] bg-opacity-20" />
                </div>
              </div>
              <div className="flex flex-col">
                <Skeleton className="rounded-[4px] h-[12px] w-[100px] mb-[10px]" />
                <Skeleton className="rounded-[4px] h-[12px] w-[60px]" />
              </div>
              <Skeleton className="rounded-[4px] h-[12px] w-[80px] ms-auto" />
            </div>
          ))}
          <Button onClick={onCancel} type="stroke" className="w-full mt-auto">
            Cancel
          </Button>
        </div>
      ) : scannedTokens?.length ? (
        <>
          <p className="mb-[20px]">
            NFID Wallet discovered new tokens with non-zero balances and added
            them to your portfolio.
          </p>
          <div
            className={clsx(
              "overflow-auto",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
            )}
          >
            {scannedTokens.map((token) => (
              <div
                key={`${token.getTokenName()}_${token.getTokenAddress()}`}
                className="flex items-center h-[60px]"
              >
                <div className="flex items-center gap-[12px] flex-0">
                  <div className="w-[28px] h-[28px] rounded-full bg-zinc-50">
                    <ImageWithFallback
                      alt={`${token.getTokenSymbol()}`}
                      className="object-cover w-full h-full rounded-full"
                      fallbackSrc={IconNftPlaceholder}
                      src={`${token.getTokenLogo()}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-black leading-[20px] font-semibold">
                      {token.getTokenSymbol()}
                    </p>
                    <p className="text-xs text-secondary leading-[20px]">
                      {token.getTokenName()}
                    </p>
                  </div>
                </div>
                <div className="ml-auto">
                  <p className="flex text-sm text-black leading-[20px]">
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
          <Button onClick={onScanned} className="w-full mt-auto">
            OK
          </Button>
        </>
      ) : (
        <>
          <p>No tokens with non-zero balances found.</p>
          <img
            className="h-[400px] m-auto"
            src={searchImg}
            alt="no tokens image"
          />
          <Button onClick={onScanned} className="w-full">
            OK
          </Button>
        </>
      )}
    </div>
  )
}
