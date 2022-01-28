import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardBody: React.FC<Props> = ({ children, className }) => {
  return <div className={clsx(className, "py-6")}>{children}</div>
}
