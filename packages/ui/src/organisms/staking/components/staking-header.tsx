import ProfileContainer from "@nfid/ui/atoms/profile-container/Container"
import { FC } from "react"

import { TokenValue } from "frontend/integration/staking/types"

export interface StakingInfoProps {
  total?: TokenValue | string
  staked?: TokenValue | string
  rewards?: TokenValue | string
  symbol: string
}

export const StakingHeader: FC<StakingInfoProps> = ({
  total,
  staked,
  rewards,
  symbol,
}) => {
  return (
    <ProfileContainer
      className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
      innerClassName="!px-[20px] md:!px-[30px]"
    >
      <div className="flex items-center gap-[20px] sm:gap-[40px] md:gap-[80px] lg:gap-[120px] flex-wrap">
        <div>
          <p className="leading-5 text-secondary dark:text-zinc-500 text-sm font-bold mb-[10px]">
            Staking balance
          </p>
          <p
            id={"stakingBalance"}
            className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap"
          >
            {total !== undefined && (
              <>
                <span className="block">
                  {typeof total === "string" ? total : total.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </span>
                <span className="block text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof total !== "string" && total.getUSDValue()}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="block w-[50%] sm:hidden"></div>
        <div>
          <p className="leading-5 text-secondary dark:text-zinc-500 text-sm font-bold mb-[10px]">
            Staked
          </p>
          <p
            id={"stakedAmount"}
            className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap"
          >
            {staked !== undefined && (
              <>
                <span className="block">
                  {typeof staked === "string" ? staked : staked.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </span>
                <span className=" block text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof staked !== "string" && staked.getUSDValue()}
                </span>
              </>
            )}
          </p>
        </div>
        <div>
          <p className="leading-5 text-secondary dark:text-zinc-500 text-sm font-bold mb-[10px]">
            Rewards
          </p>
          <p
            id={"stakingRewards"}
            className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap"
          >
            {rewards !== undefined && (
              <>
                <span className="block">
                  {typeof rewards === "string"
                    ? rewards
                    : rewards.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </span>
                <span className="block text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof rewards !== "string" && rewards.getUSDValue()}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </ProfileContainer>
  )
}
