import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"

import { IconNftPlaceholder, ImageWithFallback } from "@nfid-frontend/ui"
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

export const StakeSuccessUi: React.FC<StakeSuccessProps> = ({
  title,
  subTitle = "0.00 USD",
  onClose,
  assetImg,
  duration = 5,
  isOpen,
  status,
  error,
}) => {
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (!isOpen) return

    const runAnimation = async () => {
      if (status === SendStatus.PENDING) {
        setStep(0)
      }

      // wait until uncontrollable part of animation finishes, then rely on send status
      await new Promise((resolve) => setTimeout(resolve, 1060))
      setStep(1)

      if (status === SendStatus.COMPLETED) {
        setStep(2)
      }
      if (status === SendStatus.FAILED) {
        setStep(3)
      }
    }

    runAnimation()
  }, [status, isOpen])

  return (
    <div
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-col justify-between bg-white",
        !isOpen && "hidden",
      )}
    >
      <div className="text-center">
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
        <StakeAnimation />
      </div>
      <div className="relative z-20">
        <p className="text-sm leading-[25px] font-inter" id="title">
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
          {subTitle}
        </p>
        {error && <div className="text-sm text-red-600 mt-[30px]">{error}</div>}
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
