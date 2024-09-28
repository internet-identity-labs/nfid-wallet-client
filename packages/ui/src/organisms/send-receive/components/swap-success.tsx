import clsx from "clsx"
import { FC, useMemo } from "react"

import {
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { getAnimationByStep } from "../utils"

export interface SwapSuccessProps {
  titleFrom: string
  titleTo: string
  subTitleFrom: string
  subTitleTo: string
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  step: number
  duration?: string
  isOpen: boolean
  error?: string
}

export const SwapSuccessUi: FC<SwapSuccessProps> = ({
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  onClose,
  assetImgFrom,
  assetImgTo,
  step = 0,
  duration = "20 seconds",
  isOpen,
  error,
}) => {
  const isCompleted = useMemo(() => {
    return step === 4
  }, [step])

  const isFailed = useMemo(() => {
    return step === 5
  }, [step])

  return (
    <div
      id={"swap_success_window_" + step}
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-grow flex-col justify-between bg-white",
        !isOpen && "hidden",
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

        <div className="absolute flex items-center justify-center w-full px-3 top-0 left-0 sm:-top-[85px]">
          <LottieAnimation
            animationData={getAnimationByStep(step)}
            // TODO: adjust animations when the new Lottie files will be ready
            loop={step === 0 || step == 1 || step === 3}
          />
          <div
            className={clsx(
              "absolute h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] rounded-full p-[10px] bg-white",
              "left-[125px] sm:left-[170px] top-[160px] sm:top-[225px]",
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
              "absolute h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] rounded-full p-[10px] bg-white",
              "left-[152px] sm:left-[210px] top-[190px] sm:top-[265px] z-2",
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
        {(isFailed || error) && (
          <div className="mt-[185px] text-sm text-red-600 max-w-[320px] mx-auto">
            {error}
          </div>
        )}
      </div>
      <div className="relative z-20">
        <div className="flex items-center justify-center">
          <div className="flex-1">
            <p className="text-sm leading-[25px]" id="title">
              {titleFrom}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleFrom}
            </p>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-gray-50 flex items-center justify-center mx-[15px]">
            <IconCmpArrow className="w-[20px] h-[20px] rotate-180" />
          </div>
          <div className="flex-1">
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
      </div>
    </div>
  )
}
