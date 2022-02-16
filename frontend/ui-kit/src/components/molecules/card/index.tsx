import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Card: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(className, "bg-transparent rounded-md")}
      {...props}
    >
      {children}
    </div>
  )
}
