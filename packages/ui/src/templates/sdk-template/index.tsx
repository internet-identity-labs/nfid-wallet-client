import clsx from "clsx"
import React from "react"

import logo from "../../assets/id.svg"
import { NFIDGradientBar } from "@nfid/ui/atoms/gradient-bar"

interface ResponsiveTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  frameLabel?: string
}

export const ThirdPartyTemplate: React.FC<ResponsiveTemplateProps> = ({
  children,
  className,
  frameLabel = "Sign in with NFID",
}) => {
  return (
    <div
      className={clsx(
        "relative flex flex-col justify-between h-screen font-inter",
        "sm:min-h-[550px] sm:w-[450px] sm:absolute sm:h-auto",
        "sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2",
      )}
    >
      <NFIDGradientBar className="w-full h-0.5 z-20" rounded={false} />

      <div
        className={clsx(
          "border-b border-gray-100 mt-1 py-3 px-5 space-x-2 flex",
          "sm:border-x",
        )}
      >
        <img src={logo} alt="logo" />
        <span className="text-xs text-secondary">{frameLabel}</span>
      </div>

      <div
        className={clsx(
          "w-full h-full p-[22px] flex-grow flex flex-col",
          "sm:border-x sm:border-b sm:border-gray-100",
          className,
        )}
      >
        {children}
      </div>

      <div
        className={clsx(
          "px-5 mb-5 text-xs text-secondary",
          "sm:mt-4 text-center",
        )}
      >
        NFID is a privacy-preserving, one-touch multi-factor wallet protocol
        developed by Internet Identity Labs.
      </div>
    </div>
  )
}
