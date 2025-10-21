import clsx from "clsx"
import { HTMLAttributes } from "react"

interface ISkeleton extends HTMLAttributes<HTMLDivElement> {
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
        "rounded-[12px] bg-skeletonColor dark:bg-[#3F3F4680]",
        isAnimated && "animate-pulse",
        className,
      )}
    >
      {children}
    </div>
  )
}
