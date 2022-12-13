import clsx from "clsx"
import React from "react"

type ButtonType = "primary" | "secondary" | "stroke" | "ghost" | "red"

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  block?: boolean
  children?: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  text?: boolean
  type?: ButtonType
  isSmall?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  type = "primary",
  disabled,
  icon,
  id,
  isSmall,
  block,
  ...buttonProps
}: ButtonProps) => {
  const isPrimary = type === "primary"
  const isSecondary = type === "secondary"
  const isGhost = type === "ghost"
  const isStroke = type === "stroke"
  const isRed = type === "red"

  return (
    <button
      id={id}
      disabled={disabled}
      className={clsx(
        "transition duration-75",
        "text-center text-sm first-letter:capitalize hover:no-underline",
        "font-bold",
        "border rounded-md outline-none p-[15px] leading-4",
        "cursor-pointer disabled:cursor-not-allowed",
        "focus:ring-2 focus:ring-offset-[1px] focus:ring-black",
        isSmall ? (children ? "px-[15px] py-[11px]" : "p-[11px]") : "p-[15px]",
        isPrimary &&
          clsx(
            "text-white",
            "hover:border-blue-500 focus:border-blue-600 active:border-blue-700 disabled:border-gray-300",
            "bg-blue-600 hover:bg-blue-500 focus:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300",
            "hover:shadow-md hover:shadow-blue-700/40 disabled:shadow-none",
          ),
        isSecondary &&
          clsx(
            "text-white",
            "hover:border-gray-700 focus:border-black active:border-black disabled:border-gray-300",
            "bg-black hover:bg-gray-700 hover:bg-black-hover focus:bg-black active:bg-black active:border-black disabled:bg-gray-300",
            "hover:shadow-md hover:shadow-gray-700/40 disabled:shadow-none",
          ),
        isStroke &&
          clsx(
            "text-black hover:text-white focus:text-white active:text-white disabled:text-gray-400",
            "border-black hover:border-gray-100 disabled:border-gray-300",
            "bg-white hover:bg-gray-700 focus:bg-black active:bg-black disabled:bg-white",
            "hover:shadow-md disabled:shadow-none",
          ),
        isGhost &&
          clsx(
            "text-blue hover:underline disabled:text-gray-400",
            "border-transparent hover:border-gray-100 disabled:border-transparent",
            "active:bg-gray-200 hover:bg-gray-100 disabled:bg-white",
          ),
        isRed &&
          clsx(
            "text-white",
            "border-red-600 hover:border-red-500 focus:border-red-600 active:border-red-700 disabled:border-gray-300",
            "bg-red-600 hover:bg-red-500 focus:bg-red-600 active:bg-red-700 disabled:bg-gray-300",
            "hover:shadow-md hover:shadow-red-600/40 disabled:shadow-none",
          ),
        block && clsx("w-full block"),
        className,
      )}
      {...buttonProps}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon ? (
          <div className="w-[18px] h-[18px] flex items-center justify-center">
            {icon}
          </div>
        ) : null}
        {children ? <div className="text-center">{children}</div> : null}
      </div>
    </button>
  )
}
