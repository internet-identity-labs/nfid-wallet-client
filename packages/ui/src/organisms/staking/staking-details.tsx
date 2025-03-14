import clsx from "clsx"
import { FC, useCallback, useState } from "react"

import {
  IStakingDetails,
  IStakingOption,
  StakingOptions,
} from "frontend/features/staking-details"
import { NotFound } from "frontend/ui/pages/404"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { ArrowButton } from "../../molecules/button/arrow-button"
import { StakingHeader } from "./components/staking-header"
import { StakingOption } from "./components/staking-option"
import { StakingSidePanel } from "./components/staking-side-panel"

export interface StakingDetailsProps {
  stakingDetails: IStakingDetails
  stakeOptions: any
  onRedeemOpen: () => void
}

export const StakingDetails: FC<StakingDetailsProps> = ({
  stakingDetails,
  stakeOptions,
  onRedeemOpen,
}) => {
  const [sidePanelOption, setSidePanelOption] = useState<IStakingOption | null>(
    null,
  )
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  if (!stakingDetails) return <NotFound />

  return (
    <>
      <StakingSidePanel
        isOpen={Boolean(sidePanelOption)}
        onClose={() => setSidePanelOption(null)}
        sidePanelOption={sidePanelOption}
        onRedeemOpen={onRedeemOpen}
      />
      <div className="flex gap-[10px] items-center mb-[30px]">
        <ArrowButton
          buttonClassName="py-[7px]"
          onClick={handleNavigateBack}
          iconClassName="text-black"
        />
        <ImageWithFallback
          alt={stakingDetails.symbol}
          fallbackSrc={IconNftPlaceholder}
          src="#"
          className={clsx("w-[62px] h-[62px]", "rounded-full object-cover")}
        />
        <div>
          <p className="text-[28px] leading-[36px]">{stakingDetails.symbol}</p>
          <p className="text-xs leading-5 text-secondary">
            {stakingDetails.name}
          </p>
        </div>
      </div>
      <StakingHeader stakingInfo={stakingDetails} />
      {stakeOptions.Available.length && (
        <StakingOption
          stakingOptionType={StakingOptions.Available}
          stakingOptions={stakeOptions.Available}
          isLoading={false}
          stakingDetails={stakingDetails}
          setSidePanelOption={setSidePanelOption}
        />
      )}
      {stakeOptions.Unlocking.length && (
        <StakingOption
          stakingOptionType={StakingOptions.Unlocking}
          stakingOptions={stakeOptions.Unlocking}
          isLoading={false}
          stakingDetails={stakingDetails}
          setSidePanelOption={setSidePanelOption}
        />
      )}
      {stakeOptions.Locked.length && (
        <StakingOption
          stakingOptionType={StakingOptions.Locked}
          stakingOptions={stakeOptions.Locked}
          isLoading={false}
          stakingDetails={stakingDetails}
          setSidePanelOption={setSidePanelOption}
        />
      )}
    </>
  )
}
