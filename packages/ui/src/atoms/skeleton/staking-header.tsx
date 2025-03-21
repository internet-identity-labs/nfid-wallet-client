import ProfileContainer from "../profile-container/Container"
import { Skeleton } from "./skeleton"

export const StakingHeaderSkeleton = () => {
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
          <Skeleton className="h-[32px] w-[100px]" />
        </div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Staked
          </p>
          <Skeleton className="h-[32px] w-[100px]" />
        </div>
        <div>
          <p className="leading-5 text-secondary text-sm font-bold mb-[10px]">
            Rewards
          </p>
          <Skeleton className="h-[32px] w-[100px]" />
        </div>
      </div>
    </ProfileContainer>
  )
}
