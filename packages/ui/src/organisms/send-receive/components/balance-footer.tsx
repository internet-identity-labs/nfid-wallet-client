import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import useSWR from "swr"

import { truncateString } from "@nfid-frontend/utils"

import { FT } from "frontend/integration/ft/ft"

interface BalanceFooterProps {
  token: FT | undefined
  hasUsdBalance?: boolean
  publicKey: string
}

export const BalanceFooter = ({
  token,
  publicKey,
}: BalanceFooterProps) => {
  const { data: usdBalance, isLoading } = useSWR(
    token ? ["activeTokenUSD", token.getTokenAddress()] : null,
    token ? () => token.getUSDBalanceFormatted() : null,
  )

  return (
    <div
      className={clsx(
        "bg-gray-50 flex flex-col text-sm text-gray-500",
        "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
      )}
    >
      <div className="flex items-center justify-between">
        <p>Wallet address</p>
        <p>Balance</p>
      </div>
      <div className="flex items-center justify-between">
        {publicKey ? (
          <p>{truncateString(publicKey, 6, 4)}</p>
        ) : (
          <Spinner className="w-[16px] h-[16px]" />
        )}
        <span id="balance">
          {token?.getTokenBalanceFormatted() || `0 ${token?.getTokenSymbol()}`}
        </span>
      </div>
    </div>
  )
}
