import clsx from "clsx"
import React from "react"

export interface ButtonProps<T extends React.ElementType = "button">
  extends React.HTMLAttributes<HTMLButtonElement> {
  primary?: boolean
  secondary?: boolean
  stroke?: boolean
  error?: boolean
  block?: boolean
  text?: boolean
  large?: boolean
  disabled?: boolean
  icon?: boolean
  isActive?: boolean
  largeMax?: boolean
  as?: T
}

export const ButtonAlt = <T extends React.ElementType = "button">({
  children,
  className,
  secondary,
  primary,
  block,
  text,
  large,
  disabled,
  icon,
  largeMax,
  stroke,
  error,
  as,
  isActive,
  id,
  ...buttonProps
}: ButtonProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>) => {
  const Component = as || "button"

  return (
    <Component
      id={id}
      disabled={disabled}
      className={clsx(
        "btn",
        !disabled && "cursor-pointer",
        text && "btn-text",
        secondary &&
          "btn-secondary hover:bg-gray-700 hover:shadow-md hover:shadow-gray-700/40 disabled:shadow-none disabled:bg-gray-300 hover:bg-gray-700 hover:shadow-md hover:shadow-gray-700/40",
        stroke &&
          "btn-stroke hover:text-white hover:bg-gray-700 hover:border-gray-700 hover:shadow-md hover:shadow-gray-700/40 active:text-white active:bg-secondaryButtonColor disabled:shadow-none disabled:border-gray-300 disabled:border-secondaryButtonColor/50 disabled:text-gray-300 disabled:bg-white focus:text-black",
        large && "btn-large",
        largeMax && "btn-large-max",
        disabled && "btn-disabled",
        icon && "btn-icon",
        icon && isActive && "btn-icon-active",
        block && "btn-block",
        error && "btn-error",
        primary && "btn-primary disabled:bg-gray-300 disabled:shadow-none",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </Component>
  )
}
