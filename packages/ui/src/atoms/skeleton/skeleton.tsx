import clsx from "clsx"
import { HTMLAttributes } from "react"

interface ISkeleton extends HTMLAttributes<HTMLDivElement> {
  isAnimated?: boolean
}

export const Skeleton = ({
  className = "bg-gray-100",
  isAnimated = true,
  children,
}: ISkeleton) => {
  return (
    <div
      className={clsx(
        "rounded-[12px]",
        isAnimated && "animate-pulse",
        className,
      )}
    >
      {children}
    </div>
  )
}
