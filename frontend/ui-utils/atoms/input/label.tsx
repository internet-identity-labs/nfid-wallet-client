import React from "react"
import clsx from 'clsx'

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Label: React.FC<Props> = ({ children, className }) => {
  return (
    <label className={clsx('block text-sm font-medium text-gray-700 mb-1', className)}>
      {children}
    </label>
  )
}
