import clsx from "clsx"
import React from "react"

import { checkIsIframe } from "@nfid-frontend/utils"

import { SDKFooter } from "../../atoms/sdk-footer/footer"

interface IFrameTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  frameLabel?: string
}

export const ScreenResponsive: React.FC<IFrameTemplateProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col justify-between font-inter rounded-xl",
        "mx-2 min-h-[480px] border border-gray-100 shadow-screen",
        "absolute top-1/2 -translate-y-1/2 overflow-hidden",
        "w-[calc(100%-16px)] sm:w-[450px] sm:left-1/2 sm:-translate-x-1/2",
        checkIsIframe() && "!w-full !m-0",
      )}
    >
      <div
        className={clsx(
          "w-full h-full p-[22px] flex-grow flex flex-col",
          "sm:border sm:border-gray-100 sm:rounded-xl",
          "justify-between",
          className,
        )}
      >
        {children}
        <SDKFooter />
      </div>
    </div>
  )
}
