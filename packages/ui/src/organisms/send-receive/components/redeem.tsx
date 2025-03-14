import clsx from "clsx"
import { FC } from "react"

import { Button } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import { RedeemSuccessUi } from "./redeem-success"

export interface ReceiveProps {
  onClose: () => void
  redeem: () => void
  isSuccessOpen: boolean
  status: SendStatus
  error: string | undefined
  initial: { initial: string; initialInUsd: string }
  rewards: { rewards: string; rewardsInUsd: string }
  fee: { fee: string; feeInUsd: string }
  total: { total: string; totalInUsd: string }
}

export const Redeem: FC<ReceiveProps> = ({
  onClose,
  redeem,
  isSuccessOpen,
  status,
  error,
  initial,
  rewards,
  fee,
  total,
}) => {
  return (
    <>
      <RedeemSuccessUi
        title={total.total}
        subTitle={total.totalInUsd}
        onClose={onClose}
        assetImg="#"
        isOpen={isSuccessOpen}
        status={status}
        assetImageClassname="w-[74px] h-[74px] top-[51px]"
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
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white rounded-full">
            <div className="absolute w-0.5 bg-teal-600 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Initial stake</p>
            <p className="text-xs text-secondary">
              The amount of tokens initially staked.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">{initial.initial}</p>
            <p className="text-xs text-secondary">{initial.initialInUsd}</p>
          </div>
        </div>
        <div className="flex items-center text-sm relative pl-[35px] mb-[48px] sm:mb-[78px]">
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white rounded-full">
            <div className="absolute w-0.5 bg-teal-600 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Rewards</p>
            <p className="text-xs text-secondary">
              The amount of governance rewards earned.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">{rewards.rewards}</p>
            <p className="text-xs text-secondary">{rewards.rewardsInUsd}</p>
          </div>
        </div>
        <div className="flex items-center text-sm relative pl-[35px]">
          <div className="absolute top-[3px] left-0 w-5 h-5 bg-teal-600 border-4 border-white rounded-full">
            <div className="absolute w-0.5 bg-gray-300 left-[5px] h-[100px] sm:h-[108px] top-[100%] mt-1"></div>
          </div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[24px]">Protocol fee</p>
            <p className="text-xs text-secondary">
              The amount NFID Wallet DAO earns for its in-wallet staking
              service.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px]">{fee.fee}</p>
            <p className="text-xs text-secondary">{fee.feeInUsd}</p>
          </div>
        </div>
        <div className="mt-[22px] sm:mt-[35px] mb-[13px] pl-[35px]">
          <div className="h-[1px] bg-gray-100"></div>
        </div>

        <div className="flex items-center text-sm relative pl-[35px]">
          <div className="absolute top-0 bottom-0 left-0 w-5 h-5 my-auto bg-gray-300 border-4 border-white rounded-full"></div>
          <div className="max-w-[180px] sm:max-w-[265px]">
            <p className="leading-[28px] text-[16px] font-bold">
              Total redemption
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="leading-[24px] font-bold">{total.total}</p>
            <p className="text-xs text-secondary">{total.totalInUsd}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-[20px]">
        <Button type="stroke" id="cancelStakeButton" block onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={false}
          type="primary"
          id="stakeButton"
          block
          onClick={redeem}
        >
          Redeem
        </Button>
      </div>
    </>
  )
}
