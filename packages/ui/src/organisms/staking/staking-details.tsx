import { SignIdentity } from "@dfinity/agent"
import clsx from "clsx"
import { FC, useCallback, useState } from "react"

import { StakedToken } from "frontend/integration/staking/staked-token"
import { StakingState } from "frontend/integration/staking/types"
import { NotFound } from "frontend/ui/pages/404"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Loader } from "../../atoms/loader"
import { Skeleton } from "../../atoms/skeleton"
import { StakingHeaderSkeleton } from "../../atoms/skeleton/staking-header"
import { TableStakingOptionSkeleton } from "../../atoms/skeleton/table-staking-option"
import { ArrowButton } from "../../molecules/button/arrow-button"
import { StakingHeader } from "./components/staking-header"
import { StakingOption } from "./components/staking-option"
import {
  SidePanelOption,
  StakingSidePanel,
} from "./components/staking-side-panel"

export interface StakingDetailsProps {
  stakedToken?: StakedToken
  isLoading: boolean
  onRedeemOpen: () => void
  identity?: SignIdentity
}

export const StakingDetails: FC<StakingDetailsProps> = ({
  stakedToken,
  isLoading,
  onRedeemOpen,
  identity,
}) => {
  const [sidePanelOption, setSidePanelOption] =
    useState<SidePanelOption | null>(null)
  const [isStateLoading, setIsStateLoading] = useState(false)

  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  if (!stakedToken && !isLoading) return <NotFound />

  return (
    <>
      <StakingSidePanel
        isOpen={Boolean(sidePanelOption)}
        onClose={() => setSidePanelOption(null)}
        sidePanelOption={sidePanelOption}
        onRedeemOpen={onRedeemOpen}
        identity={identity}
        setIsLoading={setIsStateLoading}
        isLoading={isStateLoading}
      />
      {isLoading || isStateLoading || !stakedToken ? (
        <>
          <div className="flex gap-[10px] items-center mb-[30px]">
            <div className="px-[15px]">
              <Skeleton className="w-[22px] h-[34px]" />
            </div>

            <Skeleton className="w-[62px] h-[62px] rounded-full" />
            <div>
              <Skeleton className="w-[120px] h-[30px] mb-[6px]" />
              <Skeleton className="w-[100px] h-[20px]" />
            </div>
          </div>
          <StakingHeaderSkeleton />
          <TableStakingOptionSkeleton tableRowsAmount={3} tableCellAmount={4} />
        </>
      ) : (
        <>
          <div className="flex gap-[10px] items-center mb-[30px]">
            <ArrowButton
              buttonClassName="py-[7px]"
              onClick={handleNavigateBack}
              iconClassName="text-black"
            />
            <ImageWithFallback
              alt={stakedToken.getToken().getTokenSymbol()}
              fallbackSrc={IconNftPlaceholder}
              src={stakedToken.getToken().getTokenLogo()}
              className={clsx("w-[62px] h-[62px]", "rounded-full object-cover")}
            />
            <div>
              <p className="text-[28px] leading-[36px]">
                {stakedToken.getToken().getTokenSymbol()}
              </p>
              <p className="text-xs leading-5 text-secondary">
                {stakedToken.getToken().getTokenName()}
              </p>
            </div>
          </div>
          <StakingHeader
            total={stakedToken.getStakingBalanceFormatted()}
            rewards={stakedToken.getRewardsFormatted()}
            staked={stakedToken.getStakedFormatted()}
            symbol={stakedToken.getToken().getTokenSymbol()}
          />
          {stakedToken.getAvailable().length > 0 && (
            <StakingOption
              stakingState={StakingState.Available}
              stakes={stakedToken.getAvailable()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
          {stakedToken.getUnlocking().length > 0 && (
            <StakingOption
              stakingState={StakingState.Unlocking}
              stakes={stakedToken.getUnlocking()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
          {stakedToken.getLocked().length > 0 && (
            <StakingOption
              stakingState={StakingState.Locked}
              stakes={stakedToken.getLocked()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
        </>
      )}
    </>
  )
}
