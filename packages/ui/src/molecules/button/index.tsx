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
            "focus:border-primaryButtonColor active:border-primaryButtonColor border-transparent",
            "bg-primaryButtonColor focus:bg-primaryButtonColor active:bg-primaryButtonColor disabled:bg-primaryButtonColor/20",
            "hover:shadow-md hover:shadow-primaryButtonColor/40 disabled:shadow-none",
          ),
        isSecondary &&
          clsx(
            "text-white",
            "hover:border-secondaryButtonColor disabled:border-secondaryButtonColor/50",
            "bg-black hover:bg-secondaryButtonColor active:border-secondaryButtonColor disabled:bg-secondaryButtonColor/50",
            "hover:shadow-md hover:shadow-secondaryButtonColor/40 disabled:shadow-none",
          ),
        isStroke &&
          clsx(
            "text-black hover:text-white focus:text-white active:text-white disabled:text-secondary active:bg-secondaryButtonColor",
            "border-secondaryButtonColor hover:border-secondaryButtonColor disabled:border-secondaryButtonColor/50",
            "bg-transparent hover:bg-secondaryButtonColor disabled:bg-secondaryButtonColor/50 focus:bg-secondaryButtonColor",
            "hover:shadow-md disabled:shadow-none",
          ),
        isGhost &&
          clsx(
            "text-linkColor hover:underline disabled:text-secondary",
            "border-transparent disabled:border-transparent",
            "active:bg-linkColor/20 hover:bg-linkColor/10 disabled:bg-white",
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
