import React, { ReactElement } from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  solid?: boolean
  icon?: ReactElement
}

export const Chip: React.FC<Props> = ({
  children,
  className,
  icon,
  solid = false,
}) => {
  return (
    <div
      className={clsx(
        className,
        solid ? "bg-indigo-500 text-white" : "text-indigo-500",
        "px-4 h-[30px]  text-sm rounded-full border border-indigo-500 w-min flex items-center",
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </div>
  )
}
