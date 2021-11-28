import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardTitle: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={clsx("text-xl lg:text-3xl xl:text-4xl text-gray-700 font-medium text-center py-8 lg:py-14 capitalize", className)}>
      {children}
    </div>
  )
}
