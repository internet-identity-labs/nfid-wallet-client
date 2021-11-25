import React from "react"
import clsx from "clsx"

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  ...buttonProps
}) => (
  <button className={clsx("rounded-lg border-2", className)} {...buttonProps}>
    {children}
  </button>
)
