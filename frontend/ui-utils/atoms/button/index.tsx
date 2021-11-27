import React from "react"
import clsx from "clsx"

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  filled?: boolean
  block?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  filled = false,
  block = false,
  ...buttonProps
}) => (
  <button
    className={clsx(
      "py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow focus:ring-indigo-500",
      filled &&
        "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white border-0",
      block && "w-full",
      className,
    )}
    {...buttonProps}
  >
    {children}
  </button>
)
