import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { checkIsIframe } from "@nfid-frontend/utils"

import { SDKFooter } from "../../atoms/sdk-footer/footer"
import { ScreenStyleParams } from "./config"

interface IFrameTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  frameLabel?: string
}

const initialStyleConfig = {
  frameBgColor: "",
  frameBorderColor: "",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  mainTextColor: "",
  secondaryTextColor: "",
  linkColor: "",
}

export const ScreenResponsive: React.FC<IFrameTemplateProps> = ({
  children,
  className,
}) => {
  const [styleConfig, setStyleConfig] =
    useState<ScreenStyleParams>(initialStyleConfig)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setStyleConfig({
      frameBgColor: searchParams.get("frameBgColor"),
      frameBorderColor: searchParams.get("frameBorderColor"),
      primaryButtonColor: searchParams.get("primaryButtonColor"),
      secondaryButtonColor: searchParams.get("secondaryButtonColor"),
      mainTextColor: searchParams.get("mainTextColor"),
      secondaryTextColor: searchParams.get("secondaryTextColor"),
      linkColor: searchParams.get("linkColor"),
    })
  }, [searchParams])

  useEffect(() => {
    Object.entries(styleConfig).map((entry) => {
      return document.documentElement.style.setProperty(
        `--color-${entry[0]}`,
        entry[1],
      )
    })
  }, [styleConfig])

  return (
    <div
      className={clsx(
        "flex flex-col justify-between font-inter rounded-xl",
        "mx-2 min-h-[480px] border border-gray-100 shadow-screen",
        "absolute top-1/2 -translate-y-1/2 overflow-hidden",
        "w-[calc(100%-16px)] sm:w-[450px] sm:left-1/2 sm:-translate-x-1/2",
        "bg-frameBgColor border-frameBorderColor",
        checkIsIframe() && "!w-full !m-0",
      )}
    >
      <div
        className={clsx(
          "w-full h-full p-[22px] flex-grow flex flex-col",
          "sm:rounded-xl justify-between",
          "text-black",
          className,
        )}
      >
        {children}
        <SDKFooter />
      </div>
    </div>
  )
}
