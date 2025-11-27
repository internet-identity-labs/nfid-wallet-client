import { clsx } from "clsx"

import { trimConcat } from "@nfid-frontend/utils"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { Skeleton } from "../../atoms/skeleton"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { TokenIdentity } from "../../organisms/tokens/components/token-identity"

interface IChooseFtItem {
  token: FT
  isSwapTo?: boolean
  tokensAvailableToSwap?: TokensAvailableToSwap
  isBtcEthLoading?: boolean
}

export const ChooseFtItem = ({
  token,
  isSwapTo,
  tokensAvailableToSwap,
  isBtcEthLoading,
}: IChooseFtItem) => {
  const isTokenAvailable =
    (isSwapTo
      ? tokensAvailableToSwap?.to.includes(token.getTokenAddress())
      : tokensAvailableToSwap?.from.includes(token.getTokenAddress())) ??
    (false ||
      !(
        isBtcEthLoading &&
        [BTC_NATIVE_ID, ETH_NATIVE_ID].includes(token.getTokenAddress())
      ))

  return (
    <div
      id={trimConcat("choose_option_", token.getTokenSymbol())}
      className={clsx(
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 h-[60px]",
        !isTokenAvailable ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <TokenIdentity token={token} disabled={!isTokenAvailable} />
      {!token.isInited() ||
      (isBtcEthLoading &&
        [BTC_NATIVE_ID, ETH_NATIVE_ID].includes(token.getTokenAddress())) ? (
        <div>
          <Skeleton className="rounded-[6px] h-[20px] w-[80px] mb-[5px]" />
          <Skeleton className="rounded-[6px] h-[16px] w-[60px] ml-auto" />
        </div>
      ) : (
        <div className={clsx(!isTokenAvailable && "text-gray-400")}>
          <p className="text-sm text-right">{`${
            token.getTokenBalanceFormatted() || "0"
          } ${token.getTokenSymbol()}`}</p>
          <p className="text-xs text-right text-gray-400 dark:text-zinc-500">
            {token.getUSDBalanceFormatted() ?? "Not listed"}
          </p>
        </div>
      )}
    </div>
  )
}
