import InfoIcon from "packages/ui/src/atoms/icons/info-icon.svg"
import { FC } from "react"

import { Tooltip } from "@nfid-frontend/ui"

import { Spinner } from "../../atoms/loader/spinner"

export interface IProfileTemplate extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  isLoading: boolean
}

export const ProfileInfo: FC<IProfileTemplate> = ({ value, isLoading }) => {
  return (
    <div className="mt-[22px] flex flex-col sm:flex-row gap-[20px] md:gap-[30px]">
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
        <h2 className="text-[24px] text-black leading-[24px]">
          Wallet address
        </h2>
      </div>
    </div>
  )
}

export default ProfileInfo
