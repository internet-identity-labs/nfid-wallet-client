import clsx from "clsx"
import { FC, useEffect, useState } from "react"
import colors from "tailwindcss/colors"

import { CloseIcon } from "@nfid/ui/atoms/icons/close-button"
import { Button } from "@nfid/ui/molecules/button"
import BannerBg from "./banner-bg.png"

interface BtcBanner {
  onBtcSwapClick: () => void
  onConvertClick: () => void
}

export const BtcBanner: FC<BtcBanner> = ({
  onBtcSwapClick,
  onConvertClick,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const shouldShow = localStorage.getItem("showBtcBanner")
    if (shouldShow === null || shouldShow === "true") {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("showBtcBanner", "false")
  }

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        "rounded-[24px] mt-[30px] relative bg-[linear-gradient(to_bottom,_#008d7f,_#012d2f)] font-inter",
        "lg:h-[260px] lg:bg-[linear-gradient(to_right,_#008d7f,_#012d2f)] lg:p-[30px]",
      )}
    >
      <div
        className={clsx(
          "w-full aspect-[2.15] top-0 right-0 bg-cover",
          "lg:w-[560px] lg:h-full lg:absolute",
        )}
        style={{ backgroundImage: `url(${BannerBg})` }}
      ></div>
      <div
        className="w-6 h-6 absolute right-[10px] top-[10px]"
        onClick={handleClose}
      >
        <CloseIcon color={colors.white} className="w-full h-full" />
      </div>
      <div
        className={clsx(
          "text-white relative p-5",
          "lg:w-[50%] lg:max-w-[510px] lg:p-0",
        )}
      >
        <div className="text-[24px] leading-[24px] tracking-[0.01em] mb-5">
          Convert BTC to ckBTC in NFID Wallet
        </div>
        <div className="text-sm leading-[18px] mb-4 lg:pr-[20px]">
          ckBTC is wrapped Bitcoin on ICP and backed 1:1 with Bitcoin—fast,
          cheap, and powerful. Transfers take{" "}
          <span className="font-semibold">2 seconds</span> and cost{" "}
          <span className="font-semibold">less than $0.01.</span>
        </div>
        <div className="justify-between mb-5 lg:flex">
          <ul className="text-sm leading-[18px] list-none ml-0 mb-2 lg:mb-0">
            <li className="mb-2">• Trade runes on Odin.fun</li>
            <li>• Send to friends & family</li>
          </ul>
          <ul className="text-sm leading-[18px] list-none ml-0">
            <li className="mb-2">• Use across other ICP apps</li>
            <li>• Convert 1:1 with BTC at any time</li>
          </ul>
        </div>
        <div className="flex gap-[20px]">
          <Button
            type="stroke"
            className="bg-white dark:!text-black border-0 w-[120px]"
            isSmall
            onClick={onConvertClick}
          >
            Convert BTC
          </Button>
          <Button
            type="ghost"
            className="text-white dark:text-white border-white w-[230px] hover:text-primaryButtonColor"
            isSmall
            onClick={onBtcSwapClick}
          >
            Swap an ICP token for ckBTC
          </Button>
        </div>
      </div>
    </div>
  )
}
