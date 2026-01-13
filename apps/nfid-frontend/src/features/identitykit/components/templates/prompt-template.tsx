import clsx from "clsx"
import { PropsWithChildren } from "react"

import { Address, Button, LogoMain } from "@nfid/ui"
import { TickerAmount } from "@nfid/ui/molecules/ticker-amount"

export interface RPCBalanceSection {
  symbol: string
  balance: number | string
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
  className?: string
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
  className,
}: RPCPromptTemplateProps) => {
  return (
    <div className={clsx("flex flex-col flex-1 h-full", className)}>
      <div className="flex flex-col items-center mt-10 mb-10 text-sm text-center">
        {withLogo ? (
          <img alt="NFID Wallet" className="w-[182px] mb-4" src={LogoMain} />
        ) : null}
        {title && (
          <div className="block w-full text-[20px] lg:text-[28px] font-bold mb-2 lg:mb-4 dark:text-white">
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
        <div className="absolute right-[30px] top-[20px] text-xs text-right hidden lg:block z-[1000]">
          <Address
            className="justify-end font-bold"
            address={balance.address}
          />
          <div className="text-gray-500">
            <TickerAmount
              value={balance.balance}
              decimals={balance.decimals}
              symbol={balance.symbol}
            />
          </div>
        </div>
      )}
    </div>
  )
}
