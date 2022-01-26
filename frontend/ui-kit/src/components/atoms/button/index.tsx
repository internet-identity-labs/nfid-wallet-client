import React from "react"
import clsx from "clsx"

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  filled?: boolean
  block?: boolean
  text?: boolean
  large?: boolean
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  filled = false,
  block = false,
  text = false,
  large = false,
  disabled = false,
  ...buttonProps
}) => {
  return (
    <button
      className={clsx(
        "flex text-center py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 first-letter:capitalize",
        !text && "border shadow-sm hover:shadow",
        !disabled && "cursor-pointer",
        text && "hover:underline text-indigo-600",
        filled &&
          "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white border-0",
        block && "block w-full",
        large && "md:min-w-[200px]",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
