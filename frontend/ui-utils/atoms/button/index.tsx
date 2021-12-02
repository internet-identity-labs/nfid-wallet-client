import React from "react"
import clsx from "clsx"

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  filled?: boolean
  block?: boolean
  text?: boolean
  large?: boolean
  href?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  filled = false,
  block = false,
  text = false,
  large = false,
  href = "#",
}) => (
  <a
    className={clsx(
      "text-center cursor-pointer py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
      !text && "border shadow-sm hover:shadow",
      text && "hover:underline text-indigo-600",
      filled &&
        "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white border-0",
      block && "block w-full",
      large && "md:min-w-[200px]",
      className,
    )}
    href={href}
  >
    {children}
  </a>
)
