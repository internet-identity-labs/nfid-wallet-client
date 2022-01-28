import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Label: React.FC<Props> = ({ children, className }) => {
  return (
    <label
      className={clsx("text-sm text-black-base leading-4 mb-1 block", className)}
    >
      {children}
    </label>
  )
}
