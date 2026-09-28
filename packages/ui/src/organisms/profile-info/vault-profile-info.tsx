/* eslint-disable @nx/enforce-module-boundaries */
import { FC, HTMLAttributes } from "react"

import {
  IconCmpArrow,
  Skeleton,
  Button,
  IconCmpRefresh,
} from "@nfid-frontend/ui"

import { Balance } from "./balance"
import { ProfileContext } from "frontend/provider"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

export interface IVaultProfileTemplate extends HTMLAttributes<HTMLDivElement> {
  usdBalance: string | undefined
  isAddressLoading?: boolean
  isUsdLoading: boolean
  onSendClick: () => void
  onReceiveClick: () => void
  refreshPortfolio: () => void
  address?: string
  goToPortfolio: () => void
}

export const VaultProfileInfo: FC<IVaultProfileTemplate> = ({
  usdBalance,
  isUsdLoading,
  onSendClick,
  onReceiveClick,
  refreshPortfolio,
  address,
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
          {false ? (
            <Skeleton className="w-[180px] h-[24px]" />
          ) : (
            <div className="text-[22px] sm:text-[28px] font-semibold leading-5 sm:leading-[30px] dark:text-white">
              {usdBalance || "0.00"}{" "}
              <span className="text-[16px] leading-3 font-bold uppercase self-end mr-3">
                usd
              </span>
            </div>
          )}
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
