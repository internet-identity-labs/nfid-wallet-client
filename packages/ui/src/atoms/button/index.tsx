import clsx from "clsx"
import React from "react"

type ButtonType = "primary" | "secondary" | "stroke" | "ghost" | "red"

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  block?: boolean
  children?: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  large?: boolean
  largeMax?: boolean
  text?: boolean
  type?: ButtonType
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      type = "primary",
      block,
      large,
      disabled,
      icon,
      largeMax,
      isActive,
      id,
      ...buttonProps
    }: ButtonProps,
    ref,
  ) => {
    const isPrimary = type === "primary"
    const isSecondary = type === "secondary"
    const isGhost = type === "ghost"
    const isStroke = type === "stroke"

    return (
      <button
        ref={ref}
        id={id}
        disabled={disabled}
        className={clsx(
          "focus:ring-2 focus:ring-offset-[1px] focus:ring-black ",
          "border text-center text-sm font-bold rounded-md outline-none first-letter:capitalize hover:no-underline transition duration-75 p-[15px] leading-4",
          "active:outline-none active:ring-none",
          !disabled && "cursor-pointer",
          isPrimary &&
            "text-white bg-blue-600 hover:bg-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-700/40 focus:bg-blue-600 focus:border-blue-600 active:bg-blue-700 active:border-blue-700 disabled:bg-black",
          isSecondary &&
            "text-white bg-black hover:bg-gray-700 hover:border-gray-700 hover:shadow-md hover:shadow-gray-700/40 hover:bg-black-hover focus:bg-black focus:border-black active:bg-black active:border-black focus:ring-black-base ",
          isGhost &&
            "border-transparent hover:underline text-blue-600 outline-none active:bg-gray-200 hover:bg-gray-100",
          isStroke &&
            "border-black text-black hover:text-white hover:bg-gray-100 hover:shadow-none focus:text-white focus:bg-black active:bg-gray-700 active:text-white ",
          large && "btn-large",
          largeMax && "btn-large-max",
          disabled && "btn-disabled",
          icon && isActive && "btn-icon-active",
          block && "btn-block",
          className,
        )}
        {...buttonProps}
      >
        <div className="flex items-center space-x-2 center">
          {icon ? <div>{icon}</div> : null}
          {children ? <div>{children}</div> : null}
        </div>
      </button>
    )
  },
)
