import clsx from "clsx"
import { PropsWithChildren } from "react"
import useSWR from "swr"

import {
  Address,
  Button,
  IconSvgNFIDWalletLogo,
  Skeleton,
} from "@nfid-frontend/ui"

import { TickerAmount } from "frontend/ui/molecules/ticker-amount"

export interface RPCBalanceSection {
  symbol: string
  balance: number | Promise<number> | Promise<bigint>
  decimals: number
  address: string
}
export interface RPCPromptTemplateProps extends PropsWithChildren<{}> {
  primaryButtonText?: string
  onPrimaryButtonClick?: () => void
  secondaryButtonText?: string
  onSecondaryButtonClick?: () => void
  title?: string | JSX.Element
  subTitle: string | JSX.Element
  isPrimaryDisabled?: boolean
  balance?: RPCBalanceSection
  withLogo?: boolean
}

export const RPCPromptTemplate = ({
  primaryButtonText = "Approve",
  secondaryButtonText = "Reject",
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  title,
  subTitle,
  children,
  isPrimaryDisabled,
  balance,
  withLogo,
}: RPCPromptTemplateProps) => {
  const { data: resolvedBalance } = useSWR(
    balance ? [balance.balance, "balancePromise"] : null,
    async ([balance]) => {
      return typeof balance === "number" ? balance : await balance
    },
  )

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col items-center mt-10 mb-10 text-sm text-center">
        {withLogo ? (
          <img
            alt="NFID Wallet"
            className="w-[182px] mb-4"
            src={IconSvgNFIDWalletLogo}
          />
        ) : null}
        {title && (
          <div className="block w-full text-[20px] lg:text-[28px] font-bold mb-2 lg:mb-4">
            {title}
          </div>
        )}
        <div className="block w-full text-sm">{subTitle}</div>
      </div>
      {children}
      <div className={clsx("flex items-center gap-5 mt-5")}>
        {onSecondaryButtonClick && (
          <Button block type="stroke" onClick={onSecondaryButtonClick}>
            {secondaryButtonText}
          </Button>
        )}
        {onPrimaryButtonClick && (
          <Button
            block
            type="primary"
            disabled={isPrimaryDisabled}
            onClick={onPrimaryButtonClick}
          >
            {primaryButtonText}
          </Button>
        )}
      </div>
      {balance && (
        <div className="absolute right-[30px] top-[20px] text-xs text-right hidden lg:block">
          <Address
            className="justify-end font-bold"
            address={balance.address}
          />
          {resolvedBalance ? (
            <div className="text-gray-500">
              <TickerAmount
                value={Number(resolvedBalance)}
                decimals={balance.decimals}
                symbol={balance.symbol}
              />
            </div>
          ) : (
            <Skeleton className="w-[150px] h-[20px]" />
          )}
        </div>
      )}
    </div>
  )
}
