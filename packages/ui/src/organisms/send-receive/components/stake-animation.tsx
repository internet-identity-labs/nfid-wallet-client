import clsx from "clsx"
import { IconNftPlaceholder } from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import React, { useEffect, useMemo, useState } from "react"

import "./index.css"

export interface StakeSuccessProps {}

export const StakeAnimation: React.FC<StakeSuccessProps> = ({}) => {
  const [step, setStep] = useState(-1)

  return (
    <div
      className={clsx(
        "circle-gradient",
        "w-[148px] h-[148px] rounded-full p-[24px]",
        "relative before:content-[''] before:absolute before:top-0 before:left-0",
        "before:w-full before:h-full before:rounded-full before:animate-[animateCircle_2s_linear_infinite]",
        "after:content-[''] after:bg-white after:rounded-full after:w-[calc(100%-6px)] after:h-[calc(100%-6px)] after:absolute",
        "after:top-[3px] after:left-[3px]",
      )}
    >
      <div
        className={clsx(
          "absolute top-[calc(50%-2px)] z-[1]",
          "left-1/2 w-1/2 h-[4px] bg-transparent origin-left animate-[animate_2s_linear_infinite]",
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
      <ImageWithFallback
        alt="assetImg"
        src={`#`}
        fallbackSrc={IconNftPlaceholder}
        className="rounded-full w-full h-full relative z-[2]"
      />
    </div>
  )
}
