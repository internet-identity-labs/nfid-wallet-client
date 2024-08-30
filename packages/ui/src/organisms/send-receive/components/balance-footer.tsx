import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { useEffect, useState } from "react"

import { truncateString } from "@nfid-frontend/utils"

import { FT } from "frontend/integration/ft/ft"

interface BalanceFooterProps {
  token: FT | undefined
  selectedAccountAddress: string
  hasUsdBalance?: boolean
}

export const BalanceFooter = ({
  token,
  selectedAccountAddress,
  hasUsdBalance,
}: BalanceFooterProps) => {
  const [usdBalance, setUsdBalance] = useState<string | undefined>()
  useEffect(() => {
    const getRate = async () => {
      if (!hasUsdBalance) return
      const rate = await token?.getUSDBalanceFormatted()
      setUsdBalance(rate)
    }

    getRate()
  }, [])
  return (
    <div
      className={clsx(
        "bg-gray-50 flex flex-col text-sm text-gray-500",
        "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
      )}
    >
      <div className="flex items-center justify-between">
        <p>Wallet address</p>
        <p>
          Balance:&nbsp;
          {token?.getTokenBalance()}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p>{truncateString(selectedAccountAddress, 6, 4)}</p>
        {usdBalance && (
          <div className="flex items-center space-x-0.5">{usdBalance}</div>
        )}
      </div>
    </div>
  )
}
