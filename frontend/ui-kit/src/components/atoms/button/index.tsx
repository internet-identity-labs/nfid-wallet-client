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
  icon?: boolean
  largeMax?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  filled,
  block,
  text,
  large,
  disabled,
  icon,
  largeMax,
  ...buttonProps
}) => {
  return (
    <button
      className={clsx(
        "text-center p-4 text-sm font-bold rounded-md outline-none focus:ring-2 focus:ring-offset-[3px] focus:ring-black-base first-letter:capitalize",
        !text && "border border-black-base shadow-sm hover:shadow",
        !disabled && "cursor-pointer",
        text &&
          "hover:underline text-blue-base font-normal py-2 focus:ring-blue-base outline-none",
        filled &&
          "bg-black-base hover:bg-black-hover focus:ring-black-base text-white border-0",
        large && "md:w-[230px] w-full",
        largeMax && "sm:w-max w-full",
        disabled && "cursor-not-allowed opacity-20 pointer-events-none",
        icon && "flex items-center justify-center space-x-4",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
