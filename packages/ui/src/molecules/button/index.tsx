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
  innerClassName?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  innerClassName,
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
      disabled={disabled}
      className={clsx(
        "transition duration-300",
        "text-center text-sm first-letter:capitalize hover:no-underline",
        "font-bold",
        "border rounded-xl outline-none p-[15px] leading-4",
        "cursor-pointer disabled:cursor-not-allowed",
        "active:ring-2 active:ring-offset-[1px] active:ring-black",

        isSmall ? "px-[15px] h-10 leading-10 py-0" : "p-[15px] h-12",
        isPrimary &&
          clsx(
            "text-white border-transparent",
            "bg-primaryButtonColor",
            "hover:shadow-md hover:shadow-teal-600/40 hover:bg-teal-600",
            "active:bg-teal-700",
            "focus:border-primaryButtonColor focus:bg-primaryButtonColor",
            "disabled:bg-gray-300 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500 disabled:shadow-none",
          ),
        isSecondary &&
          clsx(
            "text-white dark:text-black bg-black dark:bg-gray-200 border-0",
            "hover:bg-white hover:shadow-md hover:shadow-gray-700/40",
            "dark:active:bg-gray-300",
            "focus:border-secondaryButtonColor focus:bg-secondaryButtonColor",
            "disabled:shadow-none disabled:bg-gray-300",
          ),
        isStroke &&
          clsx(
            "text-black dark:text-white bg-transparent border-secondaryButtonColor dark:border-white",
            "hover:text-white hover:bg-gray-700 hover:border-gray-700 hover:shadow-md hover:shadow-gray-700/40 dark:hover:text-black dark:hover:bg-white",
            "active:text-white active:bg-secondaryButtonColor dark:active:text-black dark:active:bg-gray-300 dark:active:border-gray-300 active:ring-offset-0",
            "disabled:shadow-none disabled:border-gray-300 disabled:border-secondaryButtonColor/50 disabled:text-gray-300 disabled:bg-white",
          ),
        isGhost &&
          clsx(
            "text-primaryButtonColor border-transparent dark:text-teal-500",
            "hover:bg-gray-100 dark:hover:bg-zinc-800",
            "active:bg-gray-200 dark:active:bg-zinc-900 active:ring-offset-0 active:ring-0",
            "disabled:bg-white disabled:border-transparent disabled:text-secondary",
          ),
        isRed &&
          clsx(
            "text-white bg-red-600 border-red-600",
            "hover:shadow-md hover:shadow-red-600/40 hover:border-red-500 hover:bg-red-500",
            "active:border-red-700 active:bg-red-700",
            "focus:border-red-600 focus:bg-red-600",
            "disabled:shadow-none disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:border-gray-300 dark:border-zinc-700 dark:text-zinc-500",
          ),
        block && clsx("w-full block"),
        className,
      )}
      {...buttonProps}
    >
      <div
        id={id}
        className={clsx(
          "flex items-center justify-center space-x-2 h-full",
          innerClassName,
        )}
      >
        {icon ? (
          <div className="flex items-center justify-center w-5 h-5">{icon}</div>
        ) : null}
        {children ? <div className="text-center">{children}</div> : null}
      </div>
    </Component>
  )
}
