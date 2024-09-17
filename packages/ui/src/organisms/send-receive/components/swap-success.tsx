import clsx from "clsx"
import React, { useMemo } from "react"

import {
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import Fail from "../assets/error.json"
import Success1 from "../assets/success_1.json"
import Success2 from "../assets/success_2.json"
import Success3 from "../assets/success_3.json"
import Success4 from "../assets/success_4.json"

export interface SwapSuccessProps {
  titleFrom: string
  titleTo: string
  subTitleFrom: string
  subTitleTo: string
  url?: string
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  step: 0 | 1 | 2 | 3 | 4
  duration: string
  error: string
}

const allAnimations = [Success1, Success2, Success3, Success4, Fail]

export const SwapSuccessUi: React.FC<SwapSuccessProps> = ({
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  url,
  onClose,
  assetImgFrom,
  assetImgTo,
  step = 0,
  duration,
  error,
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
      id={"swap_success_window_" + step}
      className={clsx(
        "text-black text-center relative h-full",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow text-center">
        <H5 className="mt-5 text-xl leading-6">
          {isFailed
            ? "Swapping failed"
            : isCompleted
            ? "Swapped successfully"
            : "Swapping..."}
        </H5>
        <p className="mt-2 text-sm leading-5">
          {isFailed
            ? "ICPSwap swap failed"
            : isCompleted
            ? ""
            : `This usually takes less than ${duration}.`}
        </p>

        <div className="absolute flex items-center justify-center w-full px-3 top-0 sm:-top-[85px]">
          <LottieAnimation
            animationData={animation}
            loop={step === 0 || step === 2}
          />
          <div
            className={clsx(
              "absolute h-[68px] w-[68px] rounded-full p-[10px] bg-white",
              "left-[108px] sm:left-[156px] top-[138px] sm:top-[202px]",
            )}
          >
            <ImageWithFallback
              alt="assetImg"
              src={`${assetImgFrom}`}
              fallbackSrc={IconNftPlaceholder}
              className="w-full h-full rounded-full"
            />
          </div>
          <div
            className={clsx(
              "absolute h-[68px] w-[68px] rounded-full p-[10px] bg-white",
              "left-[123px] sm:left-[182px] top-[152px] sm:top-[230px] z-2",
            )}
          >
            <ImageWithFallback
              alt="assetImg"
              src={`${assetImgTo}`}
              fallbackSrc={IconNftPlaceholder}
              className="w-full h-full rounded-full"
            />
          </div>
        </div>
        {isFailed && (
          <div className="mt-[185px] text-sm text-red-600 max-w-[320px] mx-auto">
            {error}
          </div>
        )}
      </div>
      <div className="relative z-20">
        <div className="flex items-center justify-center">
          <div>
            <p className="text-sm leading-[25px]" id="title">
              {titleFrom}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleFrom}
            </p>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-gray-50 flex items-center justify-center mx-[15px] sm:mx-[70px]">
            <IconCmpArrow className="w-[20px] h-[20px] rotate-180" />
          </div>
          <div>
            <p className="text-sm leading-[25px]" id="title">
              {titleTo}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleTo}
            </p>
          </div>
        </div>
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
