import clsx from "clsx"
import { FC } from "react"

import { BlurredLoader, Button } from "@nfid/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { NFIDNeuron } from "frontend/integration/staking/nfid-neuron"

import { RedeemSuccessUi } from "./redeem-success"

export interface ReceiveProps {
  onClose: () => void
  redeem: () => void
  isSuccessOpen: boolean
  status: SendStatus
  error: string | undefined
  stakeToRedeem: NFIDNeuron | undefined
  isLoading: boolean
}

export const Redeem: FC<ReceiveProps> = ({
  onClose,
  redeem,
  isSuccessOpen,
  status,
  error,
  stakeToRedeem,
  isLoading,
}) => {
  if (!stakeToRedeem || isLoading)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-xl"
        className="text-xs"
      />
    )
  return (
    <>
      <RedeemSuccessUi
        title={stakeToRedeem.getTotalValueFormatted().getTokenValue()}
        subTitle={stakeToRedeem.getTotalValueFormatted().getUSDValue()}
        onClose={onClose}
        assetImg={stakeToRedeem.getToken().getTokenLogo()}
        isOpen={isSuccessOpen}
        status={status}
        error={error}
      />
      <div
        className={clsx(
          "leading-[22px] text-[20px] font-bold mb-[30px] mt-0.5",
          "flex justify-between items-center",
        )}
      >
        <span>Redemption summary</span>
      </div>
      <div className="mb-[58px]">
        <div className="flex items-center text-sm relative pl-[35px] mb-[48px] sm:mb-[78px]">
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white dark:border-zinc-800 rounded-full">
            <div className="absolute w-0.5 bg-teal-600 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Initial stake</p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              The amount of tokens initially staked.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">
              {stakeToRedeem.getInitialStakeFormatted().getTokenValue()}
            </p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              {stakeToRedeem.getInitialStakeFormatted().getUSDValue()}
            </p>
          </div>
        </div>
        <div className="flex items-center text-sm relative pl-[35px] mb-[48px] sm:mb-[78px]">
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white dark:border-zinc-800 rounded-full">
            <div className="absolute w-0.5 bg-teal-600 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Rewards</p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              The amount of governance rewards earned.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">
              {stakeToRedeem.getRewardsFormatted().getTokenValue()}
            </p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              {stakeToRedeem.getRewardsFormatted().getUSDValue()}
            </p>
          </div>
        </div>
        <div className="flex items-center text-sm relative pl-[35px]">
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white dark:border-zinc-800 rounded-full">
            <div className="absolute w-0.5 bg-gray-300 dark:bg-zinc-400 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Protocol fee</p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              The amount NFID Wallet DAO earns for its in-wallet staking
              service.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">
              {stakeToRedeem.getProtocolFeeFormatted().getTokenValue()}
            </p>
            <p className="text-xs text-secondary dark:text-zinc-400">
              {stakeToRedeem.getProtocolFeeFormatted().getUSDValue()}
            </p>
          </div>
        </div>
        <div className="mt-[22px] sm:mt-[35px] mb-[13px] pl-[35px]">
          <div className="h-[1px] bg-gray-100 dark:bg-zinc-500"></div>
        </div>
        <div className="flex items-center text-sm relative pl-[35px]">
          <div className="absolute top-0 bottom-0 left-0 w-5 h-5 my-auto bg-gray-300 border-4 border-white rounded-full dark:border-zinc-800 dark:bg-zinc-400"></div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[28px] text-[16px] font-bold">
              Total redemption
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px] font-bold">
              {stakeToRedeem.getTotalValueFormatted().getTokenValue()}
            </p>
            <p className="text-xs text-secondary dark:text-zinc-4s00">
              {stakeToRedeem.getTotalValueFormatted().getUSDValue()}
            </p>
          </div>
        </div>
      </div>
      <Button type="primary" id="redeemButton" block onClick={redeem}>
        Redeem
      </Button>
    </>
  )
}
