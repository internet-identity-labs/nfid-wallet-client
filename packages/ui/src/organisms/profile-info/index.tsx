import clsx from "clsx"
import { FC, HTMLAttributes } from "react"

import {
  IconCmpArrow,
  IconCmpSwap,
  Tooltip,
  IconInfo,
  Skeleton,
  Button,
  CopyAddress,
  ArrowPercentChange,
} from "@nfid-frontend/ui"

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
  address?: string
}

export const ProfileInfo: FC<IProfileTemplate> = ({
  usdBalance,
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
              <span className="block max-w-[300px]">
                The portfolio value represents the total USD balance of your
                tokens and NFTs and its change over the past 24 hours, assuming
                token and NFT balances remain unchanged.
                <span className="block mt-[10px]">
                  Fungible tokens USD price powered by ICPTokens and ICPSwap.
                </span>
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
          className="text-black text-[28px] leading-[20px]"
        >
          {isUsdLoading ? (
            <Skeleton className="w-[50%] h-[24px]" />
          ) : (
            <div className="flex items-baseline flex-wrap">
              <div className="font-semibold">
                {usdBalance?.value}{" "}
                <span className="text-[16px] font-bold uppercase self-end mr-3">
                  usd
                </span>
              </div>
              {usdBalance?.dayChange && usdBalance.dayChangePercent && (
                <div className="flex mt-2.5">
                  <small
                    className={clsx("text-xs font-bold mr-2.5 self-end", {
                      "text-emerald-600": usdBalance.dayChangePositive,
                      "text-red-600": !usdBalance.dayChangePositive,
                    })}
                  >
                    {usdBalance.dayChangePositive && "+"}
                    {usdBalance.dayChange} USD
                  </small>
                  <ArrowPercentChange
                    className="self-end"
                    value={usdBalance.dayChangePercent}
                    positive={usdBalance.dayChangePositive}
                    positiveClassName="text-emerald-600"
                  />
                  <small className="text-xs ml-2.5 self-end">last 24h</small>
                </div>
              )}
            </div>
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
