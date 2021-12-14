import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardTitle: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "first-letter:capitalize font-medium lg:text-3xl py-12 sm:text-2xl text-2xl text-center text-gray-900",
        className,
      )}
    >
      {children}
    </div>
  )
}
