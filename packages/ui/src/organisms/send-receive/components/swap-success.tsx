import clsx from "clsx"
import { FC, useMemo } from "react"

import {
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { SuccessState } from "frontend/features/transfer-modal/types"

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
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  step: SuccessState
  duration: string
  error: string
}

const allAnimations = [Success1, Success2, Success3, Success4, Fail]

export const SwapSuccessUi: FC<SwapSuccessProps> = ({
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  onClose,
  assetImgFrom,
  assetImgTo,
  step = 0,
  duration,
  error,
}) => {
  const animation = useMemo(() => {
    // TODO: invoke the necessary animation according to SwapProgress
    return allAnimations[0]
  }, [step])

  const isCompleted = useMemo(() => {
    return step === "success"
  }, [step])

  const isFailed = useMemo(() => {
    return step === "error"
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
              "absolute h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] rounded-full p-[10px] bg-white",
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
              "absolute h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] rounded-full p-[10px] bg-white",
              "left-[130px] sm:left-[182px] top-[158px] sm:top-[230px] z-2",
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
