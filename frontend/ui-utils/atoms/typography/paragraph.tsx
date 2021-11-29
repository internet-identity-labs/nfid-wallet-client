import clsx from "clsx"
import React from "react"

interface Props extends React.DetailedHTMLProps<
React.HTMLAttributes<HTMLDivElement>,
HTMLDivElement
> {}

export const P: React.FC<Props> = ({ children, className }) => {
  return <p className={clsx(['mt-1 text-sm text-gray-600', className])}>{children}</p>
}
