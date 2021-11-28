import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Card: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={clsx(className, "shadow rounded-md bg-white")}>
      {children}
    </div>
  )
}
