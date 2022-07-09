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

export const Button = <T extends React.ElementType = "button">({
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
  ...buttonProps
}: ButtonProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>) => {
  const Component = as || "button"

  return (
    <Component
      disabled={disabled}
      className={clsx(
        "btn",
        !disabled && "cursor-pointer",
        text && "btn-text",
        secondary && "btn-secondary hover:bg-gray-700 focus:ring-black ",
        stroke &&
          "btn-stroke hover:bg-gray-700 !focus:ring-gray-700 focus:bg-gray-700",
        large && "btn-large",
        largeMax && "btn-large-max",
        disabled && "btn-disabled",
        icon && "btn-icon",
        icon && isActive && "btn-icon-active",
        block && "btn-block",
        error && "btn-error",
        primary && "btn-primary",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </Component>
  )
}
