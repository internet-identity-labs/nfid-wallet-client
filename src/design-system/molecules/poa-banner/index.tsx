import clsx from "clsx"
import React from "react"

import background from "./background.svg"

interface PoaBannerProps {}

export const PoaBanner: React.FC<PoaBannerProps> = ({ children }) => {
  return (
    <div
      className={clsx([
        "relative px-4 pt-3 pb-6 text-white",
        "sm:px-8",
        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
      ])}
    >
      <div className={clsx(["text-2xl font-bold", "sm:text-xl"])}>
        Achievements
      </div>
      <div className="font-normal tracking-wide">
        My expereineces and awards
      </div>
      <img src={background} className="absolute bottom-0 right-0" alt="award" />
    </div>
  )
}
