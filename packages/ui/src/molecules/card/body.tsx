import clsx from "clsx"
import React from "react"

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
