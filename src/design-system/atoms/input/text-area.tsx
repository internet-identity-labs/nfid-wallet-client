import clsx from "clsx"
import React from "react"

interface TextAreaProps extends React.HTMLAttributes<HTMLTextAreaElement> {
  rows?: number
  placeholder?: string
  helperText?: string
  errorText?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ children, className, rows = 3, helperText, errorText, ...props }, ref) => {
    return (
      <div className={clsx("", className)}>
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            "shadow-sm text-black my-1 block w-full text-sm border rounded-md font-mono bg-transparent",
            errorText
              ? "active:bg-transparent active:border-red-600 !border-red-600 box-shadow-red focus:ring-red-600"
              : "focus:ring-black focus:border-black border-black",
          )}
          {...props}
        />

        <div
          className={clsx(
            "text-sm py-1 text-gray-900",
            errorText && "!text-red-600",
          )}
        >
          {errorText ?? helperText}
        </div>
      </div>
    )
  },
)
