import { FC, HTMLAttributes } from "react"

import {
  IconCmpArrow,
  IconCmpSwap,
  Tooltip,
  IconInfo,
  Skeleton,
  Button,
  CopyAddress,
} from "@nfid-frontend/ui"

export interface IProfileTemplate extends HTMLAttributes<HTMLDivElement> {
  usdValue: string | undefined
  isAddressLoading?: boolean
  isUsdLoading: boolean
  onSendClick: () => void
  onReceiveClick: () => void
  onSwapClick: () => void
  address?: string
}

export const ProfileInfo: FC<IProfileTemplate> = ({
  usdValue,
  isAddressLoading,
  isUsdLoading,
  onSendClick,
  onReceiveClick,
  onSwapClick,
  address,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-[20px] md:gap-[30px]">
      <div className="bg-portfolioColor rounded-[24px] p-[20px] md:p-[30px] w-full">
        <div className="flex items-center justify-between mb-[20px] md:mb-[30px]">
          <p className="text-[24px] text-black leading-[24px] tracking-wide">
            Portfolio
          </p>
          <Tooltip
            align="end"
            alignOffset={-20}
            tip={
              <span>
                Fungible tokens USD price powered by
                <br /> ICPSwap.
              </span>
            }
          >
            <img
              src={IconInfo}
              alt="icon"
              className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
            />
          </Tooltip>
        </div>
        <div className="text-gray-400 text-sm font-semibold mb-[16px] leading-[20px]">
          Total balance
        </div>
        <div
          id={"totalBalance"}
          className="text-black text-[28px] font-semibold leading-[20px]"
        >
          {isUsdLoading ? (
            <Skeleton className="w-[50%] h-[24px]" />
          ) : (
            <>
              {usdValue}{" "}
              <span className="text-[16px] font-bold uppercase">usd</span>
            </>
          )}
        </div>
      </div>
      <div className="bg-portfolioColor rounded-[24px] p-[20px] md:p-[30px] w-full">
        <p className="text-[24px] text-black leading-[24px] mb-[20px] md:mb-[30px] tracking-wide">
          Wallet address
        </p>
        <div className="flex md:items-end justify-between gap-[20px] flex-col md:flex-row">
          <div>
            {!isAddressLoading && address ? (
              <CopyAddress
                address={address}
                leadingChars={6}
                trailingChars={4}
              />
            ) : (
              <Skeleton className="w-[100%] h-[20px]" />
            )}

            <div
              id="receive_button_2"
              className="text-sm text-teal-600 font-bold leading-[20px] mt-[14px] cursor-pointer"
              onClick={onReceiveClick}
            >
              Show my Account ID
            </div>
          </div>
          <div className="flex gap-[10px]">
            <Button
              id="sendButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1"
              icon={
                <IconCmpArrow className="text-gray-400 rotate-[135deg] w-[18px] h-[18px] text-white" />
              }
              onClick={onSendClick}
              isSmall
            >
              Send
            </Button>
            <Button
              id="receiveButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1"
              icon={
                <IconCmpArrow className="text-gray-400 rotate-[-45deg] w-[18px] h-[18px] text-white" />
              }
              onClick={onReceiveClick}
              isSmall
            >
              Receive
            </Button>
            <Button
              id="swapButton"
              className="flex-1 !px-0 sm:!px-[15px]"
              innerClassName="!space-x-1"
              icon={
                <IconCmpSwap className="text-gray-400 !w-[18px] !h-[18px] text-white" />
              }
              onClick={onSwapClick}
              isSmall
            >
              Swap
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
