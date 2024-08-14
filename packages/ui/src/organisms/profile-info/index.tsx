import InfoIcon from "packages/ui/src/atoms/icons/info-icon.svg"
import { FC } from "react"

import { CenterEllipsis, IconCmpArrow, Tooltip } from "@nfid-frontend/ui"
import { Button } from "@nfid-frontend/ui"

import { Spinner } from "../../atoms/loader/spinner"

export interface IProfileTemplate extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  isLoading: boolean
  onSendClick: () => void
  onReceiveClick: () => void
  address?: string
}

export const ProfileInfo: FC<IProfileTemplate> = ({
  value,
  isLoading,
  onSendClick,
  onReceiveClick,
  address,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-[20px] md:gap-[30px]">
      <div className="bg-portfolioColor rounded-[24px] p-[20px] md:p-[30px] w-full">
        <div className="flex items-center justify-between mb-[20px] md:mb-[30px]">
          <h2 className="text-[24px] text-black leading-[24px]">Portfolio</h2>
          <Tooltip
            tip={
              <span>
                Fungible tokens USD price powered by
                <br /> ICPSwap.
              </span>
            }
          >
            <img
              src={InfoIcon}
              alt="icon"
              className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
            />
          </Tooltip>
        </div>
        <div className="text-gray-400 text-sm font-semibold mb-[16px] leading-[20px]">
          Total balance
        </div>
        <div className="text-black text-[28px] font-semibold leading-[20px]">
          {isLoading ? (
            <Spinner className="w-[24px] h-[24px] text-gray-400" />
          ) : (
            <>
              {value.toFixed(2)}{" "}
              <span className="text-[16px] font-bold uppercase">usd</span>
            </>
          )}
        </div>
      </div>
      <div className="bg-portfolioColor rounded-[24px] p-[20px] md:p-[30px] w-full">
        <h2 className="text-[24px] text-black leading-[24px] mb-[20px] md:mb-[30px]">
          Wallet address
        </h2>
        <div className="flex md:items-end justify-between gap-[20px] flex-col md:flex-row">
          <div>
            <CenterEllipsis
              value={address!}
              leadingChars={5}
              trailingChars={4}
              id={"principal"}
            />
            <div
              id="receiveButton2"
              className="text-sm text-teal-600 font-bold leading-[20px] mt-[14px] cursor-pointer"
              onClick={onReceiveClick}
            >
              Show my Account ID
            </div>
          </div>
          <div className="flex gap-[10px]">
            <Button
              id="sendButton"
              className="flex-1"
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
              className="flex-1"
              icon={
                <IconCmpArrow className="text-gray-400 rotate-[-45deg] w-[18px] h-[18px] text-white" />
              }
              onClick={onReceiveClick}
              isSmall
            >
              Receive
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
