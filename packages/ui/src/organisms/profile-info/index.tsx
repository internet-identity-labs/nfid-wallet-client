import clsx from "clsx"
import { FC, HTMLAttributes, useContext } from "react"

import {
  IconCmpArrow,
  IconCmpSwap,
  Skeleton,
  Button,
  CopyAddress,
  IconCmpStake,
  IconCmpRefresh,
  Tooltip,
  IconCmpConvert,
  IconCmpBridge,
  IconCmpEarn,
} from "@nfid-frontend/ui"

import { Balance } from "./balance"
import { ProfileContext } from "frontend/provider"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"

export interface IProfileTemplate extends HTMLAttributes<HTMLDivElement> {
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
  onSwapClick: () => void
  onConvertClick: () => void
  onStakeClick: () => void
  onBridgeClick: () => void
  onEarnClick: () => void
  refreshPortfolio: () => void
  isRefreshing: boolean
  address?: string
}

export const ProfileInfo: FC<IProfileTemplate> = ({
  usdBalance,
  isAddressLoading,
  isUsdLoading,
  onSendClick,
  onReceiveClick,
  onSwapClick,
  onConvertClick,
  onStakeClick,
  onBridgeClick,
  onEarnClick,
  refreshPortfolio,
  isRefreshing,
  address,
}) => {
  const { isViewOnlyMode } = useContext(ProfileContext)
  const isMobile = getIsMobileDeviceMatch()

  return (
    <div className="p-[20px] sm:p-[30px] bg-portfolioColor dark:bg-zinc-800 rounded-[24px] flex flex-col md:flex-row justify-between md:items-center">
      <div className="flex flex-col justify-between h-full">
        <div className="mb-[20px] flex items-center">
          {!isAddressLoading && address ? (
            <CopyAddress
              alwaysShowIcon
              address={address}
              leadingChars={6}
              trailingChars={4}
              className="text-xs dark:text-white dark:hover:text-zinc-500"
              iconClassName="h-[16px] w-[16px] text-gray-400 dark:text-zinc-500"
            />
          ) : (
            <Skeleton className="w-[100%] h-[20px]" />
          )}
          {!isViewOnlyMode && (
            <div
              id="receive_button_2"
              className="text-xs text-primaryButtonColor dark:text-teal-500 cursor-pointer ml-[20px]"
              onClick={onReceiveClick}
            >
              Account ID
            </div>
          )}
          {isRefreshing ? (
            <Tooltip
              className="z-[5]"
              tip={<span>Please try again later</span>}
            >
              <div>
                <IconCmpRefresh
                  className={clsx(
                    "w-4 h-4 ml-5 text-secondary cursor-not-allowed",
                    isRefreshing && "animate-spin",
                  )}
                />
              </div>
            </Tooltip>
          ) : (
            !isViewOnlyMode && (
              <IconCmpRefresh
                className="w-4 h-4 ml-5 cursor-pointer text-secondary"
                onClick={refreshPortfolio}
              />
            )
          )}
        </div>
        <Balance
          id={"totalBalance"}
          isLoading={isUsdLoading}
          usdBalance={usdBalance}
        />
      </div>
      {!isViewOnlyMode && (
        <div>
          <div className="flex justify-between md:justify-start md:gap-[10px] mt-[20px] md:mt-0 flex-wrap md:flex-nowrap">
            <div
              className="flex flex-col basis-[calc(50%-2.5px)] mb-2.5 md:mb-0 cursor-pointer"
              id="sendButton"
              onClick={onSendClick}
            >
              <Button
                className="basis-[48px] !p-0 w-full md:w-[48px]"
                textClassName="md:hidden"
                icon={
                  <IconCmpArrow className="rotate-[135deg] w-[18px] h-[18px] text-white" />
                }
                isSmall
              >
                <span>Send</span>
              </Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center hidden md:block">
                Send
              </p>
            </div>
            <div
              className="flex flex-col basis-[calc(50%-2.5px)] mb-2.5 md:mb-0 cursor-pointer"
              id="receiveButton"
              onClick={onReceiveClick}
            >
              <Button
                className="basis-[48px] !p-0 w-full md:w-[48px]"
                textClassName="md:hidden"
                icon={
                  <IconCmpArrow className="rotate-[-45deg] w-[18px] h-[18px] text-white" />
                }
                isSmall
              >
                <span>Receive</span>
              </Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center hidden md:block">
                Receive
              </p>
            </div>
            <div
              className="flex flex-col cursor-pointer"
              id="swapButton"
              onClick={onSwapClick}
            >
              <Button
                className="basis-[48px] !p-0 w-[48px]"
                icon={
                  <IconCmpSwap
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isMobile ? "text-primaryButtonColor" : "text-white",
                    )}
                  />
                }
                isSmall
                type={isMobile ? "ghost" : "primary"}
              ></Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center">
                Swap
              </p>
            </div>
            <div
              className="flex flex-col cursor-pointer"
              id="stakeButton"
              onClick={onStakeClick}
            >
              <Button
                id="profileStakeButton"
                className="basis-[48px] !p-0 w-[48px]"
                icon={
                  <IconCmpStake
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isMobile ? "text-primaryButtonColor" : "text-white",
                    )}
                  />
                }
                isSmall
                type={isMobile ? "ghost" : "primary"}
              ></Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center">
                Stake
              </p>
            </div>
            <div
              className="flex flex-col cursor-pointer"
              id="convertButton"
              onClick={onConvertClick}
            >
              <Button
                id="profileConvertButton"
                className="basis-[48px] !p-0 w-[48px]"
                icon={
                  <IconCmpConvert
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isMobile ? "text-primaryButtonColor" : "text-white",
                    )}
                  />
                }
                isSmall
                type={isMobile ? "ghost" : "primary"}
              ></Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center">
                Convert
              </p>
            </div>
            <div
              className="flex flex-col cursor-pointer"
              id="bridgeButton"
              onClick={onBridgeClick}
            >
              <Button
                id="profileBridgeButton"
                className="basis-[48px] !p-0 w-[48px]"
                icon={
                  <IconCmpBridge
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isMobile ? "text-primaryButtonColor" : "text-white",
                    )}
                  />
                }
                isSmall
                type={isMobile ? "ghost" : "primary"}
              ></Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center">
                Bridge
              </p>
            </div>
            <div
              className="flex flex-col cursor-pointer"
              id="earnButton"
              onClick={onEarnClick}
            >
              <Button
                id="profileEarnButton"
                className="basis-[48px] !p-0 w-[48px]"
                icon={
                  <IconCmpEarn
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isMobile ? "text-primaryButtonColor" : "text-white",
                    )}
                  />
                }
                isSmall
                type={isMobile ? "ghost" : "primary"}
              ></Button>
              <p className="text-primaryButtonColor mb-0 text-xs leading-[20px] mt-1 text-center">
                Earn
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileInfo
