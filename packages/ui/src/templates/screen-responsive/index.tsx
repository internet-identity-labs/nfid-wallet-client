import clsx from "clsx"
import React from "react"

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
        "w-full shadow-screen",
        "sm:absolute overflow-hidden",
        "sm:top-1/2 sm:left-1/2 sm:-translate-y-1/2 sm:-translate-x-1/2",
        "bg-frameBgColor border-frameBorderColor",
        "sm:h-[630px] sm:w-[450px] h-screen",
      )}
    >
      <div
        id="screen-modal"
        className={clsx(
          "w-full h-full p-5 flex-grow flex flex-col",
          "sm:rounded-xl justify-between",
          "text-black",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
