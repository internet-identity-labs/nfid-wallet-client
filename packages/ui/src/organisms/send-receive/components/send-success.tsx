import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import React, { useEffect, useMemo, useState } from "react"

import {
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import depositSuccess from "../assets/NFID_WS_1_1.json"
import withdraw from "../assets/NFID_WS_3.json"
import withdrawSuccess from "../assets/NFID_WS_3_1.json"
import withdrawError from "../assets/NFID_WS_3_2.json"
import { wait } from "../utils"

export interface SuccessProps {
  title: string
  subTitle: string
  onClose?: () => void
  assetImg: string
  isAssetPadding?: boolean
  duration?: string
  isOpen: boolean
  sendStatus: SendStatus
}

const allAnimations = [depositSuccess, withdraw, withdrawSuccess, withdrawError]

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
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (!isOpen) return

    const runAnimation = async () => {
      if (sendStatus === SendStatus.PENDING) {
        setStep(0)
      }

      await wait(1060)
      setStep(1)

      if (sendStatus === SendStatus.COMPLETED) {
        setStep(2)
        toaster.success(`Transaction ${title} successful`, {
          toastId: "successTransfer",
        })
      }
      if (sendStatus === SendStatus.FAILED) {
        setStep(3)
        toaster.error("Something went wrong")
      }
    }

    runAnimation()
  }, [sendStatus, isOpen])

  const animation = useMemo(() => allAnimations[step], [step])

  console.log(step)

  return (
    <div
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
            loop={step === 1}
            className="max-w-[370px]"
          />
          <ImageWithFallback
            alt="assetImg"
            src={`${assetImg}`}
            fallbackSrc={IconNftPlaceholder}
            className={clsx(
              "absolute sm:h-[90px] h-[80px] sm:w-[90px] w-[80px] object-contain rounded-full object-center",
              "mx-auto top-[164px] sm:top-[195px] ml-[1px]",
              !isAssetPadding &&
                "!w-[98px] !h-[98px] !top-[155px] sm:!w-[112px] sm:!h-[112px] sm:!top-[184px]",
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
        <Button
          type="primary"
          block
          className="mt-[30px] !text-[16px]"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
