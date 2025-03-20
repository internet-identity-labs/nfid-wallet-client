import clsx from "clsx"
import { FC, useCallback, useState } from "react"

import { IStakingDetails, StakingType } from "frontend/features/staking-details"
import { NFIDNeuron } from "frontend/integration/staking/nfid-neuron"
import { StakedToken } from "frontend/integration/staking/staked-token"
import { NotFound } from "frontend/ui/pages/404"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Loader } from "../../atoms/loader"
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
  stakingDetails: IStakingDetails
  onRedeemOpen: () => void
}

export const StakingDetails: FC<StakingDetailsProps> = ({
  stakedToken,
  isLoading,
  stakingDetails,
  onRedeemOpen,
}) => {
  const [sidePanelOption, setSidePanelOption] =
    useState<SidePanelOption | null>(null)
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  if (isLoading) return <Loader isLoading />

  if (!stakedToken) return <NotFound />

  // console.log(
  //   "stakedToken!!",
  //   stakedToken.getLocked(),
  //   stakedToken.getAvailable(),
  // )

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
      <StakingHeader stakingInfo={stakingDetails} />
      {stakedToken.getAvailable().length > 0 && (
        <StakingOption
          stakingType={StakingType.Available}
          stakes={stakedToken.getAvailable()}
          isLoading={false}
          setSidePanelOption={setSidePanelOption}
        />
      )}
      {stakedToken.getUnlocking().length > 0 && (
        <StakingOption
          stakingType={StakingType.Unlocking}
          stakes={stakedToken.getUnlocking()}
          isLoading={false}
          setSidePanelOption={setSidePanelOption}
        />
      )}
      {stakedToken.getLocked().length > 0 && (
        <StakingOption
          stakingType={StakingType.Locked}
          stakes={stakedToken.getLocked()}
          isLoading={false}
          setSidePanelOption={setSidePanelOption}
        />
      )}
    </>
  )
}
