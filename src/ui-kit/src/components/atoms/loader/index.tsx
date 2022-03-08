import clsx from "clsx"
import React from "react"
import loaderAsset from "./loader.webp"
import { NFIDLogoID } from "./NFIDLogoID"

interface LoaderProps {
  isLoading: boolean
  fullscreen?: boolean
  imageClasses?: string
  iframe?: boolean
}

export const ImageOnlyLoader: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>> = ({ className }) => {
  return (
    <div className="group transition duration-100">
      <img
        src={loaderAsset}
        className={clsx(
          "select-none pointer-events-none group-hover:flex hidden",
          className,
        )}
      />

      <NFIDLogoID className="group-hover:hidden w-12 h-12 p-1" />
    </div>
  )
}

export const Loader: React.FC<LoaderProps> = ({
  isLoading,
  fullscreen = true,
  imageClasses,
  iframe,
}) =>
  isLoading && fullscreen ? (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50">
      <div
        className={clsx(
          "absolute w-full h-full top-0 right-0 bottom-0 left-0 bg-gray-900 opacity-[75%] pointer-events-none select-none",
          iframe && "rounded-lg",
        )}
      />
      <img
        className={clsx(
          "absolute",
          "left-1/2 -translate-x-1/2",
          "top-1/2 -translate-y-1/2",
          "m-auto w-[125px] min-w-[125px] max-w-[calc(100vw-1rem)]",
          "select-none pointer-events-none",
        )}
        src={loaderAsset}
      />
    </div>
  ) : isLoading && !fullscreen ? (
    <img
      src={loaderAsset}
      className={clsx("select-none pointer-events-none", imageClasses)}
    />
  ) : null
