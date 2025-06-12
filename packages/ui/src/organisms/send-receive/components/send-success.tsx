import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"

import {
  IconNftPlaceholder,
  ImageWithFallback,
  LottieAnimation,
} from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import Success1 from "../assets/NFID_WS_1_1.json"
import Success2 from "../assets/NFID_WS_3.json"
import Successs3 from "../assets/NFID_WS_3_1.json"
import Fail from "../assets/NFID_WS_3_2.json"

const BTC_NATIVE_DESCRIPTION =
  "BTC will be on the recipient address after 6 Bitcoin network confirmations. This usually takes about 90 minutes."

export interface SuccessProps {
  title: string
  subTitle?: string
  onClose?: () => void
  assetImg: string
  duration?: number
  isOpen: boolean
  status: SendStatus
  assetImageClassname: string
  error?: string
  isNativeBtc?: boolean
}

const allAnimations = [Success1, Success2, Successs3, Fail]

export const SendSuccessUi: React.FC<SuccessProps> = ({
  title,
  subTitle = "0.00 USD",
  onClose,
  assetImg,
  duration = 2,
  assetImageClassname,
  isOpen,
  status,
  error,
  isNativeBtc,
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

  const animation = useMemo(() => allAnimations[step], [step])

  return (
    <div
      id={"success_window_3"}
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-col justify-between bg-white",
        !isOpen && "hidden",
      )}
    >
      <div className="text-center">
        <H5 className="mt-5 text-xl font-bold leading-6">
          {status === SendStatus.FAILED
            ? "Transaction failed"
            : status === SendStatus.COMPLETED
            ? "Sent successfully"
            : "Processing..."}
        </H5>
        <p className="h-5 mt-3 text-sm leading-5">
          {status === SendStatus.FAILED
            ? "Your assets are still in your wallet."
            : status === SendStatus.COMPLETED
            ? isNativeBtc
              ? BTC_NATIVE_DESCRIPTION
              : ""
            : isNativeBtc
            ? BTC_NATIVE_DESCRIPTION
            : `This usually takes less than ${duration} seconds.`}
        </p>
        <div className="flex items-center justify-center w-full">
          <LottieAnimation
            className="max-w-[370px] flex justify-center mt-[10px]"
            animationData={animation}
            loop={step === 1}
            style={{ transform: "scale(1.1)" }}
            viewBox="0 150 360 160"
          />
          <ImageWithFallback
            alt="assetImg"
            src={`${assetImg}`}
            fallbackSrc={IconNftPlaceholder}
            className={clsx("absolute rounded-full", assetImageClassname)}
          />
        </div>
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
