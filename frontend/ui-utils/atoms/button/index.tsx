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
  <button
    className={clsx("py-2 px-10 rounded-lg border-2", className)}
    {...buttonProps}
  >
    <div className={clsx("font-bold")}>{children}</div>
  </button>
)
