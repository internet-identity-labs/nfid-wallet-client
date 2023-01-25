import clsx from "clsx"
import React from "react"

import { Label } from "@nfid-frontend/ui"

interface TextAreaProps extends React.HTMLAttributes<HTMLTextAreaElement> {
  rows?: number
  placeholder?: string
  helperText?: string
  errorText?: string
  labelText?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      children,
      className,
      labelText,
      rows = 3,
      helperText,
      errorText,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={clsx("", className)}>
        {labelText && <Label className={clsx("text-xs")}>{labelText}</Label>}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            "shadow-sm text-black my-1 block w-full text-sm border rounded-md font-mono bg-transparent",
            errorText
              ? "active:bg-transparent active:border-red-base !border-red-base box-shadow-red focus:ring-red-base"
              : "focus:ring-black focus:border-black border-black",
          )}
          {...props}
        />

        <div
          className={clsx(
            "text-sm py-1 text-secondary",
            errorText && "!text-red-base",
          )}
        >
          {errorText ?? helperText}
        </div>
      </div>
    )
  },
)
