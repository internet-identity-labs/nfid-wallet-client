import { clsx } from "clsx"

import { trimConcat } from "@nfid-frontend/utils"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Skeleton } from "../../atoms/skeleton"

interface IChooseFtItem {
  token: FT
  isSwapTo?: boolean
  tokensAvailableToSwap?: TokensAvailableToSwap
}

export const ChooseFtItem = ({
  token,
  isSwapTo,
  tokensAvailableToSwap,
}: IChooseFtItem) => {
  const isTokenAvailable = isSwapTo
    ? tokensAvailableToSwap?.to.includes(token.getTokenAddress()) ?? false
    : tokensAvailableToSwap?.from.includes(token.getTokenAddress()) ?? false

  return (
    <div
      id={trimConcat("choose_option_", token.getTokenSymbol())}
      className={clsx(
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 h-[60px]",
        !isTokenAvailable && tokensAvailableToSwap
          ? "cursor-not-allowed"
          : "cursor-pointer",
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
              !isTokenAvailable &&
                tokensAvailableToSwap &&
                "grayscale opacity-40",
            )}
          />
        )}
        <div>
          <p
            className={clsx(
              "text-sm mb-0.5 flex items-center space-x-1",
              !isTokenAvailable && tokensAvailableToSwap && "text-gray-400",
            )}
          >
            <span className="font-semibold">{token.getTokenSymbol()}</span>
          </p>
          <p className="text-xs text-left text-gray-400 dark:text-zinc-500">
            {token.getTokenName()}
          </p>
        </div>
      </div>
      {token.isInited() ? (
        <div
          className={clsx(
            !isTokenAvailable && tokensAvailableToSwap && "text-gray-400",
          )}
        >
          <p className="text-sm text-right">{`${
            token.getTokenBalanceFormatted() || "0"
          } ${token.getTokenSymbol()}`}</p>
          <p className="text-xs text-right text-gray-400 dark:text-zinc-500">
            {token.getUSDBalanceFormatted() ?? "Not listed"}
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
