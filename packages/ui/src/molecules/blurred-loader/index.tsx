import clsx from "clsx"
import React, { HTMLAttributes } from "react"

import { Loader } from "../../atoms/loader"
import { BlurOverlay } from "../blur-overlay"

interface BlurredLoaderProps extends HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  loadingMessage?: string | boolean
  overlayClassnames?: string
}
export const BlurredLoader: React.FC<BlurredLoaderProps> = ({
  isLoading,
  loadingMessage,
  children,
  className,
  overlayClassnames,
}) => {
  return (
    <>
      <div className={clsx("w-full h-full p-6", className)}>{children}</div>
      {isLoading ? (
        <BlurOverlay
          id="loader"
          className={clsx(
            "absolute top-0 bottom-0 left-0 z-20 w-full",
            overlayClassnames,
          )}
        >
          <div className="flex flex-col items-center justify-center w-full h-full px-14">
            <Loader
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4 z-20"}
            />
            {loadingMessage && (
              <div className="z-20 mt-5 text-center">{loadingMessage}</div>
            )}
          </div>
        </BlurOverlay>
      ) : null}
    </>
  )
}
