import React, { ReactElement } from "react"
import clsx from "clsx"

interface InputProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  prependedText?: string
  placeholder?: string
  type?: string
  icon?: ReactElement
}

export const Input: React.FC<InputProps> = ({
  children,
  className,
  prependedText,
  placeholder,
  type = "text",
  icon,
}) => {
  return (
    <div className={clsx("rounded-md shadow-sm mt-1", className)}>
      <div className="flex relative">
        {prependedText && (
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {prependedText}
          </span>
        )}

        <input
          type={type}
          className={clsx(
            "focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full sm:text-sm border-gray-300",
            prependedText ? "rounded-r-md" : "rounded-md",
            icon && "pr-10",
          )}
          placeholder={placeholder ?? ""}
        />

        {icon && <span className="absolute right-3 top-2">{icon}</span>}
      </div>
    </div>
  )
}
