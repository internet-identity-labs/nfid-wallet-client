import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"

import {
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import Fail from "../assets/error.json"
import Success1 from "../assets/success_1.json"
import Success2 from "../assets/success_2.json"
import Success3 from "../assets/success_3.json"
import Success4 from "../assets/success_4.json"

export interface SuccessProps {
  title: string
  subTitle: string
  onClose: () => void
  assetImg: string
  isAssetPadding?: boolean
  duration?: string
  isOpen: boolean
  sendStatus: SendStatus
}

const allAnimations = [Success1, Success2, Success3, Success4, Fail]

export const SendSuccessUi: React.FC<SuccessProps> = ({
  title,
  subTitle,
  onClose,
  assetImg,
  isAssetPadding = false,
  duration = "2 seconds",
  isOpen,
  sendStatus,
}) => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      if (step === 2) return
      setStep((prev) => prev + 1)
    }, 500)
  }, [])

  const animation = useMemo(() => {
    return allAnimations[step]
  }, [step])

  // const isCompleted = useMemo(() => {
  //   return step >= 3
  // }, [step])

  // const isFailed = useMemo(() => {
  //   return step === 4
  // }, [step])

  // const animationData = useMemo(() => {
  //   if (!isOpen) return null

  //   switch (sendStatus) {
  //     case SendStatus.PENDING:
  //       return allAnimations[2]
  //     case SendStatus.COMPLETED:
  //       return allAnimations[3]
  //     case SendStatus.FAILED:
  //       return allAnimations[4]
  //     default:
  //       return null
  //   }
  // }, [sendStatus, isOpen])

  // const shouldLoop = useMemo(() => {
  //   if (sendStatus === SendStatus.PENDING) {
  //     return true
  //   }
  //   return false
  // }, [sendStatus])

  return (
    <div
      // id={"success_window_" + step}
      id={"success_window_3"}
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-grow flex-col justify-between bg-white",
        !isOpen && "hidden",
      )}
    >
      <div className="flex-grow text-center">
        <H5 className="mt-5 text-xl leading-6">
          {sendStatus === SendStatus.FAILED
            ? "Transaction failed"
            : sendStatus === SendStatus.COMPLETED
            ? "Sent successfully"
            : "Processing..."}
        </H5>
        <p className="mt-3 text-sm leading-5">
          {sendStatus === SendStatus.FAILED
            ? "Your assets are still in your wallet."
            : sendStatus === SendStatus.COMPLETED
            ? ""
            : `This usually takes less than ${duration}.`}
        </p>
        <div className="absolute flex items-center justify-center w-full px-3 top-0 left-0 sm:-top-[25px]">
          <LottieAnimation
            animationData={animation}
            loop={step === 2}
            className="max-w-[370px]"
          />
          <ImageWithFallback
            alt="assetImg"
            src={`${assetImg}`}
            fallbackSrc={IconNftPlaceholder}
            className={clsx(
              "absolute sm:h-[90px] h-[80px] sm:w-[90px] w-[80px] object-contain rounded-full object-center",
              "mx-auto top-[140px] sm:top-[195px] ml-[1px]",
              !isAssetPadding && "!w-[112px] !h-[112px] sm:top-[185px]",
            )}
          />
        </div>
      </div>
      <div className="relative z-20">
        <p className="text-sm leading-[25px]" id="title">
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
          {subTitle}
        </p>
        <Button type="primary" block className="mt-[30px]" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}
