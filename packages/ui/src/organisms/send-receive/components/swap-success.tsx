import clsx from "clsx"
import { FC, useEffect, useMemo, useState } from "react"
import {
  DepositError,
  SlippageSwapError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/errors/types"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import {
  IconCmpArrow,
  IconCmpArrowWhite,
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid/ui"
import { Button, H5 } from "@nfid/ui"

import { useDarkTheme } from "frontend/hooks"

import deposit from "../assets/NFID_WS_1.json"
import depositSuccess from "../assets/NFID_WS_1_1.json"
import depositError from "../assets/NFID_WS_1_2.json"
import swap from "../assets/NFID_WS_2.json"
import swapError from "../assets/NFID_WS_2_1.json"
import withdraw from "../assets/NFID_WS_3.json"
import withdrawSuccess from "../assets/NFID_WS_3_1.json"
import withdrawError from "../assets/NFID_WS_3_2.json"
import SwapArrowBoxDark from "../assets/swap-success-arrow-box-dark.png"
import SwapArrowBox from "../assets/swap-success-arrow-box.png"
import { getTextStatusByStep, getTitleAndButtonText } from "../utils"

const allAnimations = {
  deposit,
  depositSuccess,
  depositError,
  swap,
  swapError,
  withdraw,
  withdrawSuccess,
  withdrawError,
}

export interface SwapSuccessProps {
  titleFrom: string
  titleTo: string
  subTitleFrom: string
  subTitleTo: string
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  step: SwapStage
  isOpen: boolean
  error?: SwapError | WithdrawError | DepositError | SlippageSwapError
  providerName: SwapName | undefined
  isResponsive?: boolean
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
  isOpen,
  error,
  providerName,
  isResponsive,
}) => {
  const isDarkTheme = useDarkTheme()
  const [currentAnimation, setCurrentAnimation] = useState<unknown>(
    allAnimations.deposit,
  )

  const isCompleted = useMemo(() => {
    return step === SwapStage.Completed
  }, [step])

  useEffect(() => {
    if (step === SwapStage.Swap) {
      setCurrentAnimation(allAnimations.depositSuccess)
    }
    if (step === SwapStage.Withdraw) {
      setCurrentAnimation(allAnimations.withdraw)
    }
    if (step === SwapStage.Completed) {
      setCurrentAnimation(allAnimations.withdrawSuccess)
    }
  }, [step])

  useEffect(() => {
    if (!error) return
    if (error instanceof DepositError)
      setCurrentAnimation(allAnimations.depositError)
    if (error instanceof SwapError || error instanceof SlippageSwapError)
      setCurrentAnimation(allAnimations.swapError)
    if (error instanceof WithdrawError)
      setCurrentAnimation(allAnimations.withdrawError)
  }, [error])

  const animationCompleteHandler = () => {
    if (step === SwapStage.Swap) {
      setCurrentAnimation(allAnimations.swap)
    } else if (step === SwapStage.TransferSwap) {
      setCurrentAnimation(allAnimations.deposit)
    } else {
      return
    }
  }

  return (
    <div
      id={"swap_success_window_" + step}
      className={clsx(
        "text-black dark:text-white text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-grow flex-col bg-white dark:bg-darkGray",
        !isOpen && "hidden",
      )}
    >
      <div id={"swap-success-title"}>
        <H5 className="mt-5 text-xl !font-bold leading-6 dark:text-white">
          {isCompleted ? "Swap successful" : "Swapping"}
        </H5>
        <p
          className={clsx(
            "h-5 mt-3 text-sm leading-5 font-inter",
            isResponsive && "mt-[30px] mb-[50px]",
          )}
        >
          {error
            ? `${providerName} ${getTitleAndButtonText(error)?.title} failed`
            : isCompleted
              ? ""
              : getTextStatusByStep(step)}
        </p>
      </div>
      <div className="relative flex items-center justify-center w-full">
        <LottieAnimation
          className="max-w-[370px] flex justify-center"
          animationData={currentAnimation}
          loop={!error && step !== SwapStage.Completed}
          onComplete={animationCompleteHandler}
          style={{ transform: "scale(1.1)" }}
          viewBox="0 150 360 160"
        />
        <div
          className={clsx(
            "absolute h-[68px] w-[68px] rounded-full p-[10px] bg-white top-[35px] left-[104px] sm:top-[28px] sm:left-[157px]",
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
            "absolute h-[68px] w-[68px] rounded-full p-[10px] bg-white z-2 top-[63px] left-[127px] sm:top-[69px] sm:left-[185px]",
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
      <div className="relative z-20">
        <div>
          <div className="pt-[20px] pb-[30px] relative">
            <p className="text-sm leading-[25px] font-inter" id="title">
              {titleFrom}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleFrom}
            </p>
            <div
              className={clsx(
                "absolute -bottom-[4px] h-[26px] w-[70px] right-0 left-0",
                "flex justify-center items-end mx-auto text-black",
              )}
              style={{
                backgroundImage: `url(${
                  isDarkTheme ? SwapArrowBoxDark : SwapArrowBox
                })`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {isDarkTheme ? (
                <IconCmpArrowWhite className="rotate-[-90deg] h-5 w-5" />
              ) : (
                <IconCmpArrow className="rotate-[-90deg] h-5 w-5" />
              )}
            </div>
          </div>
          <div className="bg-gradient-to-b from-gray-50 dark:from-zinc-700 to-white dark:to-darkGray py-[10px] rounded-t-[12px]">
            <p className="text-sm leading-[25px] font-inter" id="title">
              {titleTo}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleTo}
            </p>
          </div>
          {error && providerName && (
            <div className="text-sm text-red-600 dark:text-red-500 max-w-[320px] mx-auto mb-[20px]">
              {error.getDisplayMessage(providerName)}
            </div>
          )}
        </div>
      </div>
      <Button
        id={"swap-success-close-button"}
        type="primary"
        className="mt-auto"
        block
        onClick={onClose}
      >
        {getTitleAndButtonText(error)?.buttonText}
      </Button>
    </div>
  )
}
