import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC } from "react"

export interface StakingInfoProps {
  stakingBalance: number
  staked: number
  rewards: number
  currency: string
}

export const StakingHeader: FC<StakingInfoProps> = ({
  stakingBalance,
  staked,
  rewards,
  currency,
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
            {stakingBalance}{" "}
            <span className="text-sm md:text-[16px]">
              {currency.toUpperCase()}
            </span>
          </p>
          {currency !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              14,171.42 USD
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
              {currency.toUpperCase()}
            </span>
          </p>
          {currency !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              14,171.42 USD
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
              {currency.toUpperCase()}
            </span>
          </p>
          {currency !== "USD" && (
            <p className="text-xs leading-5 text-secondary mt-0.5">
              14,171.42 USD
            </p>
          )}
        </div>
      </div>
    </ProfileContainer>
  )
}
