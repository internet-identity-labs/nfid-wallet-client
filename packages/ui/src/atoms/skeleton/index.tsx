import clsx from "clsx"
import React from "react"

interface ISkeleton extends React.HTMLAttributes<HTMLDivElement> {
  isAnimated?: boolean
}

export const Skeleton = ({
  className,
  isAnimated = true,
  children,
}: ISkeleton) => {
  return (
    <div
      className={clsx(
        "bg-gray-100 rounded",
        isAnimated && "animate-pulse",
        className,
      )}
    >
      {children}
    </div>
  )
}
