import clsx from "clsx"
import React from "react"

import logo from "./assets/id.svg"

import { ApplicationLogo } from "../atoms/application-logo"
import { NFIDGradientBar } from "../atoms/gradient-bar"
import { Loader } from "../atoms/loader"
import { H5 } from "../atoms/typography"
import { P } from "../atoms/typography/paragraph"
import { BlurOverlay } from "../molecules/blur-overlay"
import { BlurredLoader } from "../molecules/blurred-loader"

interface IFrameTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  loadingMessage?: string | boolean
  applicationLogo?: string
  applicationName?: string
  title?: string
  subTitle?: string
}

export const ScreenResponsive: React.FC<IFrameTemplateProps> = ({
  children,
  className,
  isLoading,
  loadingMessage,
  applicationLogo,
  applicationName,
  title,
  subTitle,
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
          "border-b border-gray-100 mt-1 py-3 px-5 space-x-2 flex cursor-pointer hover:opacity-75 transition-opacity",
          "sm:border-x",
        )}
      >
        <img src={logo} alt="logo" />
        <span className="text-xs text-gray-400">Sign in with NFID</span>
      </div>

      <div
        className={clsx(
          "flex-1 px-5 pt-7",
          "sm:border-x sm:border-b sm:border-gray-100",
          className,
        )}
      >
        <div className="flex flex-col items-center">
          {applicationLogo && (
            <ApplicationLogo
              src={applicationLogo}
              applicationName={applicationName}
            />
          )}
          <H5>{title}</H5>
          <P className="mt-2">{subTitle}</P>
        </div>
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

      <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage} />
    </div>
  )
}
