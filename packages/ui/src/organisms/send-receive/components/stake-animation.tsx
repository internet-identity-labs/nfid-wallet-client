import clsx from "clsx"
import { IconNftPlaceholder } from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import React, { useEffect, useState } from "react"

import { SendStatus } from "frontend/features/transfer-modal/types"

import FailedIcon from "../assets/stake-failed.svg"
import "../assets/stake-gradient.css"
import SuccessIcon from "../assets/stake-success.svg"

const HIDE_ANIMATION_DURATION = 0.3

enum AnimationStage {
  SPINNING = "spinning",
  HIDING = "hiding",
  SHOWING = "showing",
}

export interface StakeSuccessProps {
  assetImg: string
  status: SendStatus
}

export const StakeAnimation: React.FC<StakeSuccessProps> = ({
  assetImg,
  status,
}) => {
  const [animationStage, setAnimationStage] = useState<AnimationStage>(
    status === SendStatus.PENDING
      ? AnimationStage.SPINNING
      : AnimationStage.SHOWING,
  )

  useEffect(() => {
    if (status !== SendStatus.PENDING) {
      setAnimationStage(AnimationStage.HIDING)

      const timeout = setTimeout(() => {
        setAnimationStage(AnimationStage.SHOWING)
      }, HIDE_ANIMATION_DURATION * 1000)

      return () => clearTimeout(timeout)
    }

    return
  }, [status])

  const stageClassnames: Record<
    AnimationStage,
    {
      before: string
      line: string
      imageWrapper: string
    }
  > = {
    [AnimationStage.SPINNING]: {
      before: "before:animate-animateCircle",
      line: "animate-animate",
      imageWrapper: "",
    },
    [AnimationStage.HIDING]: {
      before: "before:animate-hideCircle",
      line: "animate-hideCircle",
      imageWrapper: "opacity-0 pointer-events-none",
    },
    [AnimationStage.SHOWING]: {
      before: "before:hidden",
      line: "invisible",
      imageWrapper: "animate-showCircle",
    },
  }

  return (
    <div
      className={clsx(
        status === SendStatus.FAILED && "border-[3px] border-gray-200",
        status === SendStatus.COMPLETED && "border-[3px] border-teal-600",
        "circle-gradient flex justify-center items-center",
        "w-[148px] h-[148px] rounded-full",
        "relative before:content-[''] before:absolute before:top-0 before:left-0",
        "before:w-full before:h-full before:rounded-full",
        stageClassnames[animationStage].before,
        "after:content-[''] after:bg-white after:rounded-full after:w-[calc(100%-6px)] after:h-[calc(100%-6px)] after:absolute",
        "after:top-[3px] after:left-[3px]",
      )}
    >
      <div
        className={clsx(
          "absolute top-[calc(50%-2px)] z-[1]",
          "left-1/2 w-1/2 h-[4px] bg-transparent origin-left",
          stageClassnames[animationStage].line,
        )}
      >
        <div
          className={clsx(
            "absolute w-[31px] h-[31px] rounded-full p-2",
            "bg-[#8DD7FF] top-[-14px] right-[-14px]",
          )}
        >
          <div className="bg-[#01B1FD] w-full h-full rounded-full" />
        </div>
      </div>

      <div
        className={clsx(
          "rounded-full w-[96px] h-[96px] z-[2] flex items-center justify-center",
          status !== SendStatus.PENDING &&
            stageClassnames[animationStage].imageWrapper,
          status === SendStatus.COMPLETED && "bg-teal-600",
          status === SendStatus.FAILED && "bg-red-600",
        )}
      >
        {status !== SendStatus.PENDING ? (
          <img
            src={status === SendStatus.COMPLETED ? SuccessIcon : FailedIcon}
            alt={
              status === SendStatus.COMPLETED ? "Stake success" : "Stake failed"
            }
          />
        ) : (
          <ImageWithFallback
            alt="assetImg"
            src={assetImg}
            fallbackSrc={IconNftPlaceholder}
            className="rounded-full w-[96px] h-[96px]"
          />
        )}
      </div>
    </div>
  )
}
