import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"

import { truncateString } from "@nfid-frontend/utils"

import { AccountBalance } from "frontend/features/fungible-token/fetch-balances"
import { FT } from "frontend/integration/ft/ft"
import { e8s } from "frontend/integration/nft/constants/constants"

interface BalanceFooterProps {
  token: FT | undefined
  hasUsdBalance?: boolean
  publicKey: string
  vaultsInfo?: {
    balance: bigint | undefined
    address: string | undefined
  }
}

export const BalanceFooter = ({
  token,
  publicKey,
  vaultsInfo,
}: BalanceFooterProps) => {
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
        {vaultsInfo ? (
          vaultsInfo.address ? (
            <p>{truncateString(vaultsInfo.address, 6, 4)}</p>
          ) : (
            <Spinner className="w-[16px] h-[16px]" />
          )
        ) : publicKey ? (
          <p>{truncateString(publicKey, 6, 4)}</p>
        ) : (
          <Spinner className="w-[16px] h-[16px]" />
        )}
        <span id="balance">
          {vaultsInfo
            ? `${Number(vaultsInfo.balance) / e8s} ICP`
            : token?.getTokenBalanceFormatted() ||
              `0 ${token?.getTokenSymbol()}`}
        </span>
      </div>
    </div>
  )
}
