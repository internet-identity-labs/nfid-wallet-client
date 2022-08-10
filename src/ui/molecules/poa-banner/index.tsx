import clsx from "clsx"
import React from "react"

import background from "./background.svg"

interface PoaBannerProps {}

export const PoaBanner: React.FC<PoaBannerProps> = () => {
  return (
    <div
      className={clsx([
        "relative p-6 text-white",
        "px-3 md:px-6 sm:rounded-lg",
        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
      ])}
    >
      <div
        className={clsx(
          "text-2xl font-bold",
          "sm:text-xl",
          "text-2xl font-bold",
        )}
      >
        Achievements
      </div>
      <div
        className={clsx(
          "xs:text-[12px] xs:mt-1 xs:tracking-wider",
          "font-normal tracking-wide",
        )}
      >
        My expereineces and awards
      </div>
      <img src={background} className="absolute bottom-0 right-0" alt="award" />
    </div>
  )
}
