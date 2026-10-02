/* eslint-disable @nx/enforce-module-boundaries */
import { FC, HTMLAttributes } from "react"

import { IconCmpArrow, Button, IconCmpRefresh } from "@nfid-frontend/ui"

import { Balance } from "./balance"

export interface IVaultProfileTemplate extends HTMLAttributes<HTMLDivElement> {
  usdBalance:
    | {
        value: string
        dayChange?: string
        dayChangePercent?: string
        dayChangePositive?: boolean
      }
    | undefined
  isAddressLoading?: boolean
  isUsdLoading: boolean
  onSendClick: () => void
  onReceiveClick: () => void
  refreshPortfolio: () => void
  goToPortfolio: () => void
}

export const VaultProfileInfo: FC<IVaultProfileTemplate> = ({
  usdBalance,
  isUsdLoading,
  onSendClick,
  onReceiveClick,
  refreshPortfolio,
  goToPortfolio,
}) => {
  return (
    <div className="p-[20px] sm:p-[30px] bg-portfolioColor dark:bg-zinc-800 rounded-[24px]">
      <div className="flex items-center justify-between mb-5 sm:mb-[30px]">
        <span className="dark:text-white leading-6 text-[20px] sm:text-[24px] tracking-[0.3px]">
          Portfolio
        </span>
        <div className="flex items-center gap-3">
          <Button
            className="font-bold text-sm leading-[22px]"
            type="ghost"
            onClick={goToPortfolio}
          >
            View
          </Button>
          <IconCmpRefresh
            className="w-5 h-5 text-black cursor-pointer dark:text-white"
            onClick={refreshPortfolio}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between sm:items-end sm:flex-row">
        <div>
          <p className="text-sm font-bold leading-5 text-gray-400 dark:text-zinc-500 mb-2.5">
            Known token value
          </p>
          <Balance
            id={"totalBalance"}
            isLoading={isUsdLoading}
            usdBalance={usdBalance}
          />
        </div>
        <div className="flex gap-2.5 mt-5 sm:mt-0">
          <Button
            className="w-full sm:w-[140px] max-w-1/2"
            icon={
              <IconCmpArrow className="rotate-[135deg] w-[18px] h-[18px] text-white" />
            }
            isSmall
            id="vaultSendButton"
            onClick={onSendClick}
          >
            <span>Send</span>
          </Button>

          <Button
            className="w-full sm:w-[140px] max-w-1/2"
            icon={
              <IconCmpArrow className="rotate-[-45deg] w-[18px] h-[18px] text-white" />
            }
            isSmall
            id="vaultReceiveButton"
            onClick={onReceiveClick}
          >
            <span>Receive</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VaultProfileInfo
