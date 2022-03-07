import clsx from "clsx"
import React from "react"

interface TextAreaProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  rows?: number
  placeholder?: string
  infoMessage?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ children, className, rows = 3, infoMessage, ...props }, ref) => {
    return (
      <div className={clsx("", className)}>
        <textarea
          ref={ref}
          rows={rows}
          className="shadow-sm focus:ring-black-base focus:border-black-base text-black-base my-1 block w-full text-sm border border-black-base rounded-md font-mono bg-transparent"
          {...props}
        />

        {infoMessage && (
          <p className="mt-2 text-xs text-gray-500">{infoMessage}</p>
        )}
      </div>
    )
  },
)
