import clsx from "clsx"
import React, { useState } from "react"
import { HiX } from "react-icons/hi"

interface IFrameHeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  onClick: () => void
}

export const IFrameHeader: React.FC<IFrameHeaderProps> = ({
  children,
  className,
  title,
  onClick,
}) => {
  return (
    <div className="w-full text-black overflow-hidden rounded-t-xl border-b border-gray-200 bg-white">
      <div
        className={clsx(
          title ? "justify-between" : "flex-row-reverse",
          "flex items-center h-full w-full p-4",
        )}
      >
        {title && (
          <div className="first-letter:capitalize font-medium">{title}</div>
        )}

        <HiX
          className="rounded-xl cursor-pointer text-2xl text-gray-400 hover:text-gray-500"
          onClick={onClick}
        />
      </div>
    </div>
  )
}
