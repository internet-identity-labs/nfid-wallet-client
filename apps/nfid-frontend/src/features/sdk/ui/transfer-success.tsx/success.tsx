import clsx from "clsx"
import React, { useMemo } from "react"

import {
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid/ui"
import { Button, H5 } from "@nfid/ui"

import Fail from "../assets/error.json"
import Success1 from "../assets/success_1.json"
import Success2 from "../assets/success_2.json"
import Success3 from "../assets/success_3.json"
import Success4 from "../assets/success_4.json"

export interface SuccessProps {
  title: string
  subTitle: string
  url?: string
  onClose: () => void
  assetImg: string
  isAssetPadding?: boolean
  step: number
  duration: string
}

const allAnimations = [Success1, Success2, Success3, Success4, Fail]

export const Success: React.FC<SuccessProps> = ({
  title,
  subTitle,
  url,
  onClose,
  assetImg,
  isAssetPadding = false,
  step = 0,
  duration,
}) => {
  const animation = useMemo(() => {
    return allAnimations[step]
  }, [step])

  const isCompleted = useMemo(() => {
    return step >= 3
  }, [step])

  const isFailed = useMemo(() => {
    return step === 4
  }, [step])

  return (
    <div
      id={`success_window_${step}`}
      className={clsx(
        "text-black text-center relative h-[440px]",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow text-center">
        <H5 className="mt-5 text-xl leading-6">
          {isFailed
            ? "Transaction failed"
            : isCompleted
              ? "Sent successfully"
              : "Processing..."}
        </H5>
        <p className="mt-2 text-sm leading-5">
          {isFailed
            ? "Your assets are still in your wallet."
            : isCompleted
              ? ""
              : `This usually takes less than ${duration}.`}
        </p>

        <div className="absolute flex items-center justify-center w-full px-3 top-0 sm:-top-[65px]">
          <LottieAnimation
            animationData={animation}
            loop={step === 0 || step === 2}
          />
          <ImageWithFallback
            alt="assetImg"
            src={`${assetImg}`}
            fallbackSrc={IconNftPlaceholder}
            className={clsx(
              "absolute sm:h-[90px] h-[80px] sm:w-[90px] w-[80px] object-contain rounded-full object-center",
              "mx-auto top-[140px] sm:top-[205px] ml-[1px]",
              isAssetPadding && "p-4",
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
        {url && (
          <>
            <Button
              block
              type="ghost"
              className="mt-2.5"
              onClick={() => window.open(url, "_blank")}
            >
              View transaction
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
