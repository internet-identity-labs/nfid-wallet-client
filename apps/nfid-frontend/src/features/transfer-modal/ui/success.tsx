import clsx from "clsx"
import React, { useMemo } from "react"

import { LottieAnimation } from "@nfid-frontend/ui"
import { Button, H5, Image } from "@nfid-frontend/ui"

import Success1 from "../assets/success_1.json"
import Success2 from "../assets/success_2.json"
import Success3 from "../assets/success_3.json"
import Success4 from "../assets/success_4.json"

export interface ITransferModalSuccess {
  title: string
  subTitle: string
  url?: string
  onClose: () => void
  assetImg: string
  isAssetPadding?: boolean
  step: 0 | 1 | 2 | 3
}

const allAnimations = [Success1, Success2, Success3, Success4]

export const Success: React.FC<ITransferModalSuccess> = ({
  title,
  subTitle,
  url,
  onClose,
  assetImg,
  isAssetPadding = false,
  step = 0,
}) => {
  const animation = useMemo(() => {
    return allAnimations[step]
  }, [step])

  return (
    <div
      id={"success_window_" + step}
      className={clsx(
        "text-black text-center relative",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow text-center">
        <H5 className="mt-5 text-xl leading-6">Processing...</H5>
        <p className="mt-2 text-sm leading-5">
          This usually takes less than 10 min.
        </p>
        <div className="absolute flex items-center justify-center w-full px-3 -top-20">
          <LottieAnimation
            animationData={animation}
            loop={step === 0 || step === 2}
          />
          <Image
            src={assetImg}
            className={clsx(
              "absolute h-[120px] w-[120px] object-contain -mt-[123px] ml-[1px] rounded-full object-center",
              isAssetPadding && "p-4",
            )}
          />
        </div>
      </div>
      <div className="relative z-20">
        <p className="font-bold" id="title">
          {title}
        </p>
        <p className="mt-1 text-sm text-gray-400" id="subTitle">
          {subTitle}
        </p>
        <Button type="primary" block className="mt-10" onClick={onClose}>
          Done
        </Button>
        {url && (
          <Button
            block
            type="ghost"
            className="mt-2.5"
            onClick={() => window.open(url, "_blank")}
          >
            View transaction
          </Button>
        )}
      </div>
    </div>
  )
}
