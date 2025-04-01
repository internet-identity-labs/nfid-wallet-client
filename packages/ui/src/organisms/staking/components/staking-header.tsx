import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
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
      className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px]"
      innerClassName="!px-[20px] md:!px-[30px]"
    >
      <div className="flex items-center gap-[20px] sm:gap-[40px] md:gap-[80px] lg:gap-[120px] flex-wrap">
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Staking balance
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {total !== undefined && (
              <>
                <p>
                  {typeof total === "string" ? total : total.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </p>
                <p className="text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof total !== "string" && total.getUSDValue()}
                </p>
              </>
            )}
          </p>
        </div>
        <div className="block w-[50%] sm:hidden"></div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Staked
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {staked !== undefined && (
              <>
                <p>
                  {typeof staked === "string" ? staked : staked.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </p>
                <p className="text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof staked !== "string" && staked.getUSDValue()}
                </p>
              </>
            )}
          </p>
        </div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Rewards
          </p>
          <p className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap">
            {rewards !== undefined && (
              <>
                <p>
                  {typeof rewards === "string"
                    ? rewards
                    : rewards.getTokenValue()}{" "}
                  <span className="text-sm md:text-[16px]">{symbol}</span>
                </p>
                <p className="text-xs leading-5 text-secondary mt-0.5 font-normal">
                  {typeof rewards !== "string" && rewards.getUSDValue()}
                </p>
              </>
            )}
          </p>
        </div>
      </div>
    </ProfileContainer>
  )
}
