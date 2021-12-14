import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardBody: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={clsx(className, "px-6 sm:px-10 py-6 sm:p-6 w-4xl mx-auto")}>
      {children}
    </div>
  )
}
