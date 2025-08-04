import { FC, HTMLAttributes } from "react"

import {
  IconCmpArrow,
  IconCmpSwap,
  Skeleton,
  Button,
  CopyAddress,
  IconCmpConvertWhite,
  IconCmpStake,
} from "@nfid-frontend/ui"

import { Balance } from "./balance"

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
  address,
}) => {
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
          <div
            id="receive_button_2"
            className="text-xs text-primaryButtonColor dark:text-teal-500 cursor-pointer ml-[20px]"
            onClick={onReceiveClick}
          >
            Account ID
          </div>
        </div>
        <Balance
          id={"totalBalance"}
          isLoading={isUsdLoading}
          usdBalance={usdBalance}
        />
      </div>
      <div>
        <div className="flex justify-between md:justify-start md:gap-[10px] mt-[20px] md:mt-0">
          <div className="flex flex-col">
            <Button
              id="sendButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full w-[56px] sm:w-[72px] md:w-auto"
              icon={
                <IconCmpArrow className="text-gray-400 rotate-[135deg] w-[18px] h-[18px] text-white" />
              }
              onClick={onSendClick}
              isSmall
            >
              <span className="hidden md:flex">Send</span>
            </Button>
            <p className="text-primaryButtonColor md:hidden mb-0 text-xs leading-[20px] mt-[4px] text-center">
              Send
            </p>
          </div>
          <div className="flex flex-col">
            <Button
              id="receiveButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full w-[56px] sm:w-[72px] md:w-auto"
              icon={
                <IconCmpArrow className="text-gray-400 rotate-[-45deg] w-[18px] h-[18px] text-white" />
              }
              onClick={onReceiveClick}
              isSmall
            >
              <span className="hidden md:flex">Receive</span>
            </Button>
            <p className="text-primaryButtonColor md:hidden mb-0 text-xs leading-[20px] mt-[4px] text-center">
              Receive
            </p>
          </div>
          <div className="flex flex-col">
            <Button
              id="swapButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full w-[56px] sm:w-[72px] md:w-auto"
              icon={
                <IconCmpSwap className="text-gray-400 !w-[18px] !h-[18px] text-white" />
              }
              onClick={onSwapClick}
              isSmall
            >
              <span className="hidden md:flex">Swap</span>
            </Button>
            <p className="text-primaryButtonColor md:hidden mb-0 text-xs leading-[20px] mt-[4px] text-center">
              Swap
            </p>
          </div>
          <div className="flex flex-col">
            <Button
              id="profileStakeButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full w-[56px] sm:w-[72px] md:w-auto"
              icon={
                <IconCmpStake className="text-gray-400 !w-[18px] !h-[18px] text-white" />
              }
              onClick={onStakeClick}
              isSmall
            >
              <span id={"stakeButton"} className="hidden md:flex">
                Stake
              </span>
            </Button>
            <p className="text-primaryButtonColor md:hidden mb-0 text-xs leading-[20px] mt-[4px] text-center">
              Stake
            </p>
          </div>
          <div className="flex flex-col">
            <Button
              id="profileConvertButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full w-[56px] sm:w-[72px] md:w-auto"
              icon={
                <IconCmpConvertWhite className="!text-gray-400 !w-[18px] !h-[18px] text-white" />
              }
              onClick={onConvertClick}
              isSmall
            >
              <span id={"convertButton"} className="hidden md:flex">
                Convert
              </span>
            </Button>
            <p className="text-primaryButtonColor md:hidden mb-0 text-xs leading-[20px] mt-[4px] text-center">
              Convert
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
