import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"

import { truncateString } from "@nfid-frontend/utils"

interface BalanceFooterProps {
  isLoading: boolean
  balance: number
  decimals: number | undefined
  selectedTokenCurrency: string
  rate?: number
  selectedAccountAddress: string
}

export const BalanceFooter = ({
  isLoading,
  balance,
  decimals,
  selectedTokenCurrency,
  rate,
  selectedAccountAddress,
}: BalanceFooterProps) => (
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
        {!isLoading ? (
          <span id="balance">
            <TickerAmount
              value={balance}
              decimals={decimals}
              symbol={selectedTokenCurrency}
            />
          </span>
        ) : (
          <Spinner className="w-3 h-3 text-gray-400" />
        )}
      </p>
    </div>
    <div className="flex items-center justify-between">
      <p>{truncateString(selectedAccountAddress, 6, 4)}</p>
      {!!rate && (
        <div className="flex items-center space-x-0.5">
          {!isLoading ? (
            <TickerAmount
              value={Number(balance)}
              decimals={decimals}
              symbol={selectedTokenCurrency}
              usdRate={rate}
            />
          ) : (
            <Spinner className="w-3 h-3 text-gray-400" />
          )}
        </div>
      )}
    </div>
  </div>
)
