import React from "react"

import { Loader } from "frontend/ui/atoms/loader"

import { BlurOverlay } from "../blur-overlay"

interface BlurredLoaderProps {
  isLoading?: boolean
  loadingMessage?: string | boolean
  children?: React.ReactNode
}
export const BlurredLoader: React.FC<BlurredLoaderProps> = ({
  isLoading,
  loadingMessage,
  children,
}) => {
  return (
    <>
      <div className="w-full h-full p-6">{children}</div>
      {isLoading ? (
        <BlurOverlay
          id="loader"
          className="absolute top-0 bottom-0 left-0 z-20 w-full"
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
