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

export interface SuccessProps {
  title: string
  subTitle: string
  onClose?: () => void
  assetImg: string
  isFtToken?: boolean
  duration?: number
  isOpen: boolean
  status: SendStatus
}

const allAnimations = [Success1, Success2, Successs3, Fail]

export const SendSuccessUi: React.FC<SuccessProps> = ({
  title,
  subTitle,
  onClose,
  assetImg,
  isFtToken = false,
  duration = 2,
  isOpen,
  status,
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
        <H5 className="mt-5 text-xl leading-6">
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
            ? ""
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
            className={clsx(
              "absolute  rounded-full ",
              isFtToken
                ? "w-[74px] h-[74px] top-[151px]"
                : "w-[102px] h-[102px] top-[136px] sm:w-[116px] sm:h-[116px] sm:top-[129px]",
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
