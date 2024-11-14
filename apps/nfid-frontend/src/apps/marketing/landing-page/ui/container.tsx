import clsx from "clsx"
import { HTMLAttributes } from "react"

export function Container({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("max-w-[1220px] w-[calc(100%-60px)] mx-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
}
