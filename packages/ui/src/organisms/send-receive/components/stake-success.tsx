import clsx from "clsx"
import { FC } from "react"

import { Button, H5 } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import { StakeAnimation } from "./stake-animation"

export interface StakeSuccessProps {
  title: string
  subTitle?: string
  onClose?: () => void
  assetImg: string
  duration?: number
  isOpen: boolean
  status: SendStatus
  error?: string
}

export const StakeSuccessUi: FC<StakeSuccessProps> = ({
  title,
  subTitle = "0.00 USD",
  onClose,
  assetImg,
  duration = 5,
  isOpen,
  status,
  error,
}) => {
  return (
    <div
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-col justify-between bg-white",
        !isOpen && "hidden",
      )}
    >
      <div className={clsx("text-center", { "mb-[50px]": !!error })}>
        <H5 className="mt-5 text-xl !font-bold leading-6">
          {status === SendStatus.FAILED
            ? "Transaction failed"
            : status === SendStatus.COMPLETED
            ? "Staked successfully"
            : "Staking..."}
        </H5>
        <p className="h-5 mt-3 text-sm leading-5">
          {status === SendStatus.FAILED
            ? "Your assets are still in your wallet."
            : status === SendStatus.COMPLETED
            ? ""
            : `This usually takes about ${duration} seconds. `}
        </p>
      </div>
      <div className="relative flex items-center justify-center w-full">
        <StakeAnimation assetImg={assetImg} status={status} />
      </div>
      <div className="relative z-20">
        <p className="text-sm leading-[25px] font-inter" id="title">
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
          {subTitle}
        </p>
        {error && (
          <div className="text-sm text-red-600 mt-[20px]">
            Something went wrong with creating stake. <br />
            Please try again later.
          </div>
        )}
        <Button
          type="primary"
          block
          className={clsx(error ? "mt-[20px]" : "mt-[30px]")}
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
