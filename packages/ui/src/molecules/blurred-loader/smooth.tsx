import clsx from "clsx"
import React, { HTMLAttributes, useState, useEffect } from "react"

import { Loader } from "../../atoms/loader"
import { BlurOverlay } from "../blur-overlay"

interface SmoothBlurredLoaderProps extends HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  loadingMessage?: string | boolean
  overlayClassnames?: string
}

export const SmoothBlurredLoader: React.FC<SmoothBlurredLoaderProps> = ({
  isLoading,
  loadingMessage,
  children,
  className,
  overlayClassnames,
}) => {
  const [isVisible, setIsVisible] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
    } else {
      setTimeout(() => {
        setIsVisible(false)
      }, 1000)
    }
  }, [isLoading])

  return (
    <>
      <div className={clsx("w-full h-full", className)}>{children}</div>
      {isVisible && (
        <BlurOverlay
          id="loader"
          className={clsx(
            "absolute top-0 bottom-0 left-0 z-20 w-full",
            overlayClassnames,
            isLoading ? "opacity-100 scale-100" : "opacity-0 scale-90",
            "transform transition-all duration-1000 ease-in-out",
          )}
        >
          <div className="flex flex-col items-center justify-center w-full h-full px-14">
            <Loader
              isLoading={isVisible}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4 z-20"}
            />
            {loadingMessage && (
              <div className="z-20 mt-5 text-sm text-center">
                {loadingMessage}
              </div>
            )}
          </div>
        </BlurOverlay>
      )}
    </>
  )
}
