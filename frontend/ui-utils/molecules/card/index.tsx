import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Card: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={clsx([
        "shadow rounded-md",
        "px-4 py-5 bg-white sm:p-6",
        className,
      ])}
    >
      {children}
    </div>
  )
}
