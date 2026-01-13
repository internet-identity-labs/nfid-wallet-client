import clsx from "clsx"
import React, { useEffect } from "react"

import { Loader, NFIDLogoMain } from "@nfid/ui"

import { NFIDGradientBar } from "@nfid/ui/atoms/gradient-bar"
import { BlurOverlay } from "@nfid/ui/molecules/blur-overlay"

interface IFrameWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  logo?: boolean
  isLoading?: boolean
  loadingMessage?: string
}

export const IFrameScreen: React.FC<IFrameWrapperProps> = ({
  children,
  className,
  title,
  logo,
  isLoading,
  loadingMessage,
}) => {
  const ref = React.useRef(0)

  useEffect(() => {
    const timeout = setInterval(() => {
      const newHeight = window.document.body.clientHeight

      if (ref.current !== newHeight) {
        window.parent.postMessage({ height: newHeight, title: title }, "*")
        ref.current = newHeight
      }
    }, 200)

    return () => clearInterval(timeout)
  }, [title])
  return (
    <div className="relative min-h-[510px]">
      <NFIDGradientBar />

      {logo && <NFIDLogoMain className="px-5 pt-6" />}

      <div className={clsx("p-5 relative", className)}>{children}</div>
      {isLoading && (
        <div className="absolute top-0 bottom-0 w-full">
          <BlurOverlay className="absolute top-0 left-0 z-10 w-full h-full" />
          <div className="z-20 flex flex-col items-center justify-center w-full h-full px-14">
            <Loader
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4 z-20"}
            />
            {loadingMessage && (
              <div className="z-20 mt-5 text-center">{loadingMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
