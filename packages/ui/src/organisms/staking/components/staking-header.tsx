import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC } from "react"

import { IStakingInfo } from "frontend/features/staking"

export interface StakingInfoProps {
  stakingInfo: IStakingInfo
}

export const StakingHeader: FC<StakingInfoProps> = ({ stakingInfo }) => {
  const { stakingBalance, staked, rewards, symbol } = stakingInfo

  return (
    <ProfileContainer
      className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px]"
      innerClassName="!px-[20px] md:!px-[30px]"
    >
      <div className="flex items-center gap-[20px] sm:gap-[40px] md:gap-[80px] lg:gap-[120px] flex-wrap">
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Staking balance
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {stakingBalance}{" "}
            <span className="text-sm md:text-[16px]">
              {symbol.toUpperCase()}
            </span>
          </p>
          {symbol !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              {stakingBalance} {symbol}
            </p>
          )}
        </div>
        <div className="block w-[50%] sm:hidden"></div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Staked
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {staked}{" "}
            <span className="text-sm md:text-[16px]">
              {symbol.toUpperCase()}
            </span>
          </p>
          {symbol !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              {stakingBalance} {symbol}
            </p>
          )}
        </div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Rewards
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {rewards}{" "}
            <span className="text-sm md:text-[16px]">
              {symbol.toUpperCase()}
            </span>
          </p>
          {symbol !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              {stakingBalance} {symbol}
            </p>
          )}
        </div>
      </div>
    </ProfileContainer>
  )
}
