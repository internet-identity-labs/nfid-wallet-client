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
        "text-center p-4 text-sm font-bold rounded-md focus:ring-2 focus:ring-offset-[3px] focus:ring-black-base first-letter:capitalize",
        !text && "border border-black-base shadow-sm hover:shadow",
        !disabled && "cursor-pointer",
        text && "hover:underline text-black",
        filled &&
          "bg-black-base hover:bg-black-hover focus:ring-black-base text-white border-0",
        large && "md:min-w-[230px] w-full",
        disabled && "cursor-not-allowed opacity-20 pointer-events-none",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
