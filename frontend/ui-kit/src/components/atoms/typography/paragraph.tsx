import clsx from "clsx"
import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  small?: boolean
}

export const P: React.FC<Props> = ({ children, className, small = false }) => {
  return (
    <p className={clsx(["mt-1 text-gray-600", small && "text-sm", className])}>
      {children}
    </p>
  )
}
