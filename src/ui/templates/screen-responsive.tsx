import clsx from "clsx"
import React from "react"

import logo from "./assets/id.svg"

import { NFIDGradientBar } from "../atoms/gradient-bar"
import { MaintenanceError } from "../molecules/maintenance-error"
import { useMaintenance } from "../utils/use-maintenance"

interface IFrameTemplateProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScreenResponsive: React.FC<IFrameTemplateProps> = ({
  children,
  className,
}) => {
  // TM - Temporary Maintenance
  const { isDown } = useMaintenance()

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
          "border-b border-gray-100 mt-1 py-3 px-5 space-x-2 flex cursor-pointer hover:opacity-75 transition-opacity",
          "sm:border-x",
        )}
      >
        <img src={logo} alt="logo" />
        <span className="text-xs text-gray-400">Sign in with NFID</span>
      </div>

      <div
        className={clsx(
          "w-full h-full",
          "sm:border-x sm:border-b sm:border-gray-100",
          className,
        )}
      >
        <MaintenanceError isDown={isDown} />
        {children}
      </div>

      <div
        className={clsx(
          "px-5 mb-5 text-xs text-gray-400",
          "sm:mt-4 sm:text-center",
        )}
      >
        NFID is a privacy-preserving, one-touch multi-factor wallet protocol
        developed by Internet Identity Labs.
      </div>
    </div>
  )
}
