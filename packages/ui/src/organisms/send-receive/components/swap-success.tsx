import { DelegationIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { FC, useEffect, useMemo, useState } from "react"
import { errorHandlerFactory } from "src/integration/icpswap/error-handler/handler-factory"

import {
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import {
  DepositError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import deposit from "../assets/NFID_WS_1.json"
import depositSuccess from "../assets/NFID_WS_1_1.json"
import depositError from "../assets/NFID_WS_1_2.json"
import swap from "../assets/NFID_WS_2.json"
import swapError from "../assets/NFID_WS_2_1.json"
import withdraw from "../assets/NFID_WS_3.json"
import withdrawSuccess from "../assets/NFID_WS_3_1.json"
import withdrawError from "../assets/NFID_WS_3_2.json"
import { getErrorType, getTextStatusByStep } from "../utils"

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
  duration?: number
  isOpen: boolean
  error?: SwapError | WithdrawError | DepositError
  transaction: SwapTransaction | undefined
  identity?: DelegationIdentity
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
  duration = 20,
  isOpen,
  error,
  transaction,
  identity,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<any>(
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
    if (error instanceof SwapError) setCurrentAnimation(allAnimations.swapError)
    if (error instanceof WithdrawError)
      setCurrentAnimation(allAnimations.withdrawError)
  }, [error])

  const animationCompleteHandler = () => {
    if (step === SwapStage.Swap) {
      setCurrentAnimation(allAnimations.swap)
    } else {
      return
    }
  }

  const completeHandler = async () => {
    // try catch
    if (!transaction || !identity) return
    const errorHandler = errorHandlerFactory.getHandler(transaction)
    await errorHandler.completeTransaction(identity)
    onClose()
  }

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
          {isCompleted ? "Swap successful" : "Swapping"}
        </H5>
        <p className="mt-3 text-sm leading-5">
          {error
            ? `ICPSwap ${getErrorType(error)?.title} failed`
            : isCompleted
            ? ""
            : `This usually takes less than ${duration} seconds.`}
        </p>

        <div className="absolute flex items-center justify-center w-full px-3 top-0 left-0 sm:-top-[55px]">
          <LottieAnimation
            className="max-w-[370px]"
            animationData={currentAnimation}
            loop={!error && step !== SwapStage.Completed}
            onComplete={animationCompleteHandler}
          />
          <div
            className={clsx(
              "absolute h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] rounded-full p-[10px] bg-white",
              "left-[125px] sm:left-[175px] top-[160px] sm:top-[186px]",
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
              "left-[152px] sm:left-[205px] top-[190px] sm:top-[227px] z-2",
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
        {error ? (
          <div className="mt-[185px] text-sm text-red-600 max-w-[320px] mx-auto">
            {error.getDisplayMessage()}
          </div>
        ) : (
          <div className="mt-[185px] text-sm text-gray-500 max-w-[320px] mx-auto">
            {getTextStatusByStep(step)}
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
        <Button
          type="primary"
          block
          className="mt-[30px]"
          onClick={completeHandler}
        >
          {getErrorType(error)?.button}
        </Button>
      </div>
    </div>
  )
}
