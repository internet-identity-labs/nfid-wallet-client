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
  as?: React.ElementType
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
  as: Component = "button",
  ...buttonProps
}: ButtonProps) => {
  const isPrimary = type === "primary"
  const isSecondary = type === "secondary"
  const isGhost = type === "ghost"
  const isStroke = type === "stroke"
  const isRed = type === "red"

  return (
    <Component
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
            "text-white border-transparent",
            "bg-primaryButtonColor",
            "hover:shadow-md hover:shadow-primaryButtonColor/40",
            "active:bg-primaryButtonColor active:border-primaryButtonColor",
            "focus:border-primaryButtonColor focus:bg-primaryButtonColor",
            "disabled:bg-primaryButtonColor/20 disabled:shadow-none",
          ),
        isSecondary &&
          clsx(
            "text-white bg-black",
            "hover:border-secondaryButtonColor hover:bg-secondaryButtonColor hover:shadow-md hover:shadow-secondaryButtonColor/40",
            "focus:border-secondaryButtonColor focus:bg-secondaryButtonColor",
            "disabled:border-secondaryButtonColor/50 disabled:bg-secondaryButtonColor/50",
            "active:border-secondaryButtonColor active:bg-secondaryButtonColor",
            "disabled:shadow-none",
          ),
        isStroke &&
          clsx(
            "text-black bg-transparent border-secondaryButtonColor",
            "hover:text-white hover:bg-secondaryButtonColor hover:border-secondaryButtonColor hover:shadow-md",
            "active:text-white active:bg-secondaryButtonColor",
            "focus:text-white focus:bg-secondaryButtonColor",
            "disabled:shadow-none disabled:bg-secondaryButtonColor/50 disabled:border-secondaryButtonColor/50 disabled:text-secondary",
          ),
        isGhost &&
          clsx(
            "text-linkColor border-transparent",
            "hover:bg-linkColor/10 hover:underline",
            "active:bg-linkColor/20",
            "disabled:bg-white disabled:border-transparent disabled:text-secondary",
          ),
        isRed &&
          clsx(
            "text-white bg-red-600 border-red-600",
            "hover:shadow-md hover:shadow-red-600/40 hover:border-red-500 hover:bg-red-500",
            "active:border-red-700 active:bg-red-700",
            "focus:border-red-600 focus:bg-red-600",
            "disabled:shadow-none disabled:bg-gray-300 disabled:border-gray-300",
          ),
        block && clsx("w-full block"),
        className,
      )}
      {...buttonProps}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon ? (
          <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        ) : null}
        {children ? <div className="text-center">{children}</div> : null}
      </div>
    </Component>
  )
}
