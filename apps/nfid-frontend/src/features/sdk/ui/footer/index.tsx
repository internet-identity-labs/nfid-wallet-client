import { DelegationIdentity } from "@dfinity/identity"

import clsx from "clsx"

import { ICP_DECIMALS } from "@nfid/integration/token/constants"
import { Skeleton } from "@nfid/ui"
import { TickerAmount } from "@nfid/ui/molecules/ticker-amount"
import { truncateString } from "@nfid/utils"

export const SDKFooter = ({
  identity,
  balance,
  isBalanceLoading,
}: {
  identity?: DelegationIdentity
  balance?: bigint
  isBalanceLoading?: boolean
}) => {
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
        <div className="lowercase">
          {identity?.getPrincipal().toString() ? (
            truncateString(identity?.getPrincipal().toString(), 6, 4)
          ) : (
            <Skeleton className="w-40 h-5 bg-gray-300" />
          )}
        </div>
        <div className="flex items-center space-x-0.5">
          <span id="balance">
            {balance === undefined || isBalanceLoading ? (
              <Skeleton className="w-20 h-5 bg-gray-300" />
            ) : (
              <TickerAmount
                symbol="ICP"
                value={Number(balance)}
                decimals={ICP_DECIMALS}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
