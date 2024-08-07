import clsx from "clsx"
import React from "react"

type ButtonType = "primary" | "secondary" | "stroke" | "ghost" | "red" | "green"

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
  const isGreen = type === "green"

  return (
    <Component
      id={id}
      disabled={disabled}
      className={clsx(
        "transition duration-75",
        "text-center text-sm first-letter:capitalize hover:no-underline",
        "font-bold",
        "border rounded-xl outline-none p-[15px] leading-4",
        "cursor-pointer disabled:cursor-not-allowed",
        "focus:ring-2 focus:ring-offset-[1px] focus:ring-black",
        isSmall ? "px-[15px] h-10 leading-10 py-0" : "p-[15px]",
        isPrimary &&
          clsx(
            "text-white border-transparent",
            "bg-primaryButtonColor",
            "hover:shadow-md hover:shadow-[#0D9488]/40 hover:bg-[#0D9488]",
            "active:bg-teal-700",
            "focus:border-primaryButtonColor focus:bg-primaryButtonColor",
            "disabled:bg-zinc-300 disabled:shadow-none",
          ),
        isSecondary &&
          clsx(
            "text-white bg-black border-0",
            "hover:bg-gray-700 hover:shadow-md hover:shadow-gray-700/40",
            "focus:border-secondaryButtonColor focus:bg-secondaryButtonColor",
            "disabled:shadow-none disabled:bg-gray-300",
          ),
        isStroke &&
          clsx(
            "text-black bg-transparent border-secondaryButtonColor",
            "hover:text-white hover:bg-gray-700 hover:border-gray-700 hover:shadow-md hover:shadow-gray-700/40",
            "active:text-white active:bg-secondaryButtonColor",
            "disabled:shadow-none disabled:border-gray-300 disabled:border-secondaryButtonColor/50 disabled:text-gray-300 disabled:bg-white",
          ),
        isGhost &&
          clsx(
            "text-primaryButtonColor border-transparent",
            "hover:bg-gray-100",
            "active:bg-gray-200",
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
        isGreen &&
          clsx(
            "text-white bg-[#0D9488] border-transparent rounded-[12px]",
            "hover:shadow-md hover:shadow-[#0D9488]/40 hover:bg-[#00A899]",
            "active:border-teal-700 active:bg-teal-700",
            "focus:ring-0 focus:ring-offset-0 focus:ring-transparent",
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
