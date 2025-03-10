import clsx from "clsx"
import { FC, useCallback } from "react"
import { useParams } from "react-router-dom"

import { NotFound } from "frontend/ui/pages/404"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { ArrowButton } from "../../molecules/button/arrow-button"
import { StakingHeader } from "./components/staking-header"
import { StakingOption, StakingOptions } from "./components/staking-option"

export interface StakingProps {}

export const StakingDetails: FC<StakingProps> = ({}) => {
  const { tokenSymbol } = useParams()

  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  if (!tokenSymbol) return <NotFound />

  return (
    <>
      <div className="flex gap-[10px] items-center mb-[30px]">
        <ArrowButton
          buttonClassName="py-[7px]"
          onClick={handleNavigateBack}
          iconClassName="text-black"
        />
        <ImageWithFallback
          alt="ckETH"
          fallbackSrc={IconNftPlaceholder}
          src="#"
          className={clsx("w-[62px] h-[62px]", "rounded-full object-cover")}
        />
        <div>
          <p className="text-[28px] leading-[36px]">ICP</p>
          <p className="text-xs leading-5 text-secondary">Internet Computer</p>
        </div>
      </div>
      <StakingHeader
        stakingBalance={14127.15}
        staked={13279.521}
        rewards={847.629}
        currency={tokenSymbol}
      />
      <StakingOption
        stakingOption={StakingOptions.Available}
        isLoading={false}
      />
      <StakingOption
        stakingOption={StakingOptions.Unlocking}
        isLoading={false}
      />
      <StakingOption stakingOption={StakingOptions.Locked} isLoading={false} />
    </>
  )
}
