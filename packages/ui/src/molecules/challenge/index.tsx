import clsx from "clsx"
import React from "react"

import { RefreshIcon } from "@nfid/ui/atoms/icons/refresh"

import spinner from "./spinner.png"

interface ChallengeProps {
  isLoading?: boolean
  src?: string
  refresh?: () => void
}

export const Challenge: React.FC<ChallengeProps> = ({
  isLoading,
  src,
  refresh,
}) => {
  return (
    <div
      className={clsx(
        "h-[150px] w-auto rounded-md my-4 flex",
        "bg-white border border-gray-200",
      )}
    >
      {isLoading || !src ? (
        <div className="flex flex-col w-full h-full my-auto text-center animate-pulse center">
          <div className="h-5 m-auto">
            <img
              className="inline-block animate-spin"
              alt="spinner"
              src={spinner}
            />
            <span
              id="captcha-spinner"
              className="inline-block ml-2 text-xs font-normal align-middle opacity-40"
            >
              Fetching captcha from blockchain
            </span>
          </div>
        </div>
      ) : (
        <img
          id="captcha-img"
          alt="captcha"
          src={src}
          className="object-contain w-full h-full"
        />
      )}
      {refresh && (
        <div
          className={clsx(
            "flex items-center justify-center w-10 h-full bg-gray-200 rounded-r-md",
            "cursor-pointer",
          )}
          onClick={refresh}
        >
          <RefreshIcon />
        </div>
      )}
    </div>
  )
}
