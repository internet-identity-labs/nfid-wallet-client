import React from "react"
import clsx from "clsx"
import { Divider } from "frontend/ui-utils/atoms/divider"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardTitle: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "text-xl sm:text-2xl lg:text-3xl text-gray-700 font-medium text-center py-6 capitalize",
        className,
      )}
    >
      {children}
    </div>
  )
}
