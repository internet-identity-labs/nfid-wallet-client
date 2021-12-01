import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardBody: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={clsx("px-4 py-6 sm:p-6 max-w-4xl mx-auto", className)}>
      {children}
    </div>
  )
}
