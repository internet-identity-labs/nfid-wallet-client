import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  menuItem?: boolean
}

export const Label: React.FC<Props> = ({ menuItem, children, className }) => {
  return (
    <label
      className={clsx(
        "text-sm text-black-base leading-4 mb-1 block",
        menuItem && "px-3 font-bold pt-2",
        className,
      )}
    >
      {children}
    </label>
  )
}
