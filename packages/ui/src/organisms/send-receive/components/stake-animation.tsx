import clsx from "clsx"
import { IconNftPlaceholder } from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import React, { useEffect, useState } from "react"

import { SendStatus } from "frontend/features/transfer-modal/types"

import "../assets/stake-gradient.css"
import SuccessIcon from "../assets/stake-success.svg"

const ANIMATION_DURATION = 1

export interface StakeSuccessProps {
  assetImg: string
  status: SendStatus
}

export const StakeAnimation: React.FC<StakeSuccessProps> = ({
  assetImg,
  status,
}) => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (status !== SendStatus.PENDING) {
      setTimeout(() => setIsAnimating(false), ANIMATION_DURATION) // 1s delay to let it finish
    }
  }, [status])

  return (
    <div
      className={clsx(
        status === SendStatus.FAILED && "border-[3px] border-gray-200",
        status === SendStatus.COMPLETED && "border-[3px] border-teal-600",
        "circle-gradient flex justify-center items-center",
        "w-[148px] h-[148px] rounded-full",
        "relative before:content-[''] before:absolute before:top-0 before:left-0",
        "before:w-full before:h-full before:rounded-full",
        isAnimating
          ? `before:animate-[animateCircle_${ANIMATION_DURATION}s_linear_infinite]`
          : "before:hidden",
        "after:content-[''] after:bg-white after:rounded-full after:w-[calc(100%-6px)] after:h-[calc(100%-6px)] after:absolute",
        "after:top-[3px] after:left-[3px]",
      )}
    >
      <div
        className={clsx(
          "absolute top-[calc(50%-2px)] z-[1]",
          "left-1/2 w-1/2 h-[4px] bg-transparent origin-left ",
          isAnimating
            ? `animate-[animate_${ANIMATION_DURATION}s_linear_infinite]`
            : "invisible",
        )}
      >
        <div
          className={clsx(
            "absolute w-[31px] h-[31px] rounded-full p-2",
            "bg-[#8DD7FF] top-[-14px] right-[-14px]",
          )}
        >
          <div className="bg-[#01B1FD] w-full h-full rounded-full"></div>
        </div>
      </div>
      {status === SendStatus.COMPLETED ? (
        <div className="w-[96px] h-[96px] rounded-full bg-teal-600 flex items-center justify-center z-[2]">
          <img src={SuccessIcon} alt="Success" />
        </div>
      ) : (
        <ImageWithFallback
          alt="assetImg"
          src={assetImg}
          fallbackSrc={IconNftPlaceholder}
          className="rounded-full relative z-[2] w-[96px] h-[96px]"
        />
      )}
    </div>
  )
}
