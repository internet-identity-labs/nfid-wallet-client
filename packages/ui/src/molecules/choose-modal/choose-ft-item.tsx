import { clsx } from "clsx"
import { useEffect, useState } from "react"

import { trimConcat } from "@nfid-frontend/utils"

import { FT } from "frontend/integration/ft/ft"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Skeleton } from "../../atoms/skeleton"

interface IChooseFtItem {
  token: FT
}

export const ChooseFtItem = ({ token }: IChooseFtItem) => {
  const [usdPrice, setUsdPrice] = useState<string | undefined>("")

  useEffect(() => {
    token.getUSDBalanceFormatted().then(setUsdPrice)
  }, [token.getTokenBalance()])

  return (
    <div
      id={trimConcat("choose_option_", token.getTokenSymbol())}
      className={clsx(
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer h-[60px]",
      )}
    >
      <div className="flex items-center h-[28px]">
        {token.getTokenLogo() === null ? (
          <Skeleton className="w-12 h-12 mr-[18px] rounded-[12px]" />
        ) : (
          <ImageWithFallback
            alt={token.getTokenSymbol()}
            fallbackSrc={IconNftPlaceholder}
            src={token.getTokenLogo() || "#"}
            className={clsx(
              "mr-[18px] w-[28px] h-[28px] object-cover rounded-full",
            )}
          />
        )}
        <div>
          <p className="text-sm mb-0.5 flex items-center space-x-1">
            <span className="font-semibold">{token.getTokenSymbol()}</span>
          </p>
          <p className="text-xs text-left text-gray-400">
            {token.getTokenName()}
          </p>
        </div>
      </div>
      {token.isInited() ? (
        <div>
          <p className="text-sm text-right">{`${
            token.getTokenBalanceFormatted() || "0"
          } ${token.getTokenSymbol()}`}</p>
          <p className="text-xs text-right text-gray-400">
            {usdPrice ?? "Not listed"}
          </p>
        </div>
      ) : (
        <div>
          <Skeleton className="rounded-[6px] h-[20px] w-[80px] mb-[5px]" />
          <Skeleton className="rounded-[6px] h-[16px] w-[60px] ml-auto" />
        </div>
      )}
    </div>
  )
}
