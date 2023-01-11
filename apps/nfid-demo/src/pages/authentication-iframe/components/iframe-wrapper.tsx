import clsx from "clsx"
import React from "react"

interface IFrameWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  fixedHeight?: boolean
}

export const IFrameWrapper: React.FC<IFrameWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div
      id="iframe-wrapper-card"
      className={clsx(
        "bg-white rounded-b-xl md:rounded-b-xl w-full md:w-[380px] duration-200 ease-in-out overflow-hidden",
        "flex flex-col",
        "h-[480px] w-[360px]",
        className,
      )}
    >
      {children}
    </div>
  )
}
