import clsx from "clsx"
import React from "react"

import loaderImg from "./loader.webp"

interface LoaderProps {
  isLoading: boolean
  fullscreen?: boolean
  imageClasses?: string
}

export const Loader: React.FC<LoaderProps> = ({
  isLoading,
  fullscreen = true,
  imageClasses,
}) =>
  isLoading && fullscreen ? (
    <div
      id="loader"
      className="fixed top-0 bottom-0 left-0 right-0 z-50 w-full h-full"
    >
      <div
        className={clsx(
          "absolute w-full h-full top-0 right-0 bottom-0 left-0 bg-gray-900 opacity-[75%] pointer-events-none select-none",
        )}
      />
      <img
        alt="loader"
        className={clsx(
          "absolute",
          "left-1/2 -translate-x-1/2",
          "top-1/2 -translate-y-1/2",
          "m-auto w-[125px] min-w-[125px] max-w-[calc(100vw-1rem)]",
          "select-none pointer-events-none",
        )}
        src={loaderImg}
      />
    </div>
  ) : isLoading && !fullscreen ? (
    <img
      id="loader"
      alt="loader"
      src={loaderImg}
      className={clsx("select-none pointer-events-none", imageClasses)}
    />
  ) : null
