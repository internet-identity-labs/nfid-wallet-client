import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC } from "react"

export interface EarnHeaderProps {
  value?: string
}

export const EarnHeader: FC<EarnHeaderProps> = ({ value }) => {
  return (
    <ProfileContainer
      className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
      innerClassName="!px-[20px] md:!px-[30px]"
    >
      <div className="flex items-center gap-[20px] sm:gap-[40px] md:gap-[80px] lg:gap-[120px] flex-wrap">
        <div>
          <p className="leading-5 text-secondary dark:text-zinc-500 text-sm font-bold mb-[10px]">
            Total
          </p>
          <p
            id={"stakingBalance"}
            className="leading-[32px] text-[22px] md:text-[26px] font-semibold whitespace-nowrap"
          >
            {value && (
              <>
                <span className="block">{value}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </ProfileContainer>
  )
}
