import clsx from "clsx"
import React from "react"

import { Label } from "@nfid-frontend/ui"

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number
  placeholder?: string
  helperText?: string
  errorText?: string
  labelText?: string
  areaClassName?: string
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
      areaClassName,
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
            areaClassName,
            "shadow-sm text-black block w-full text-sm border rounded-[12px] bg-transparent resize-none",
            errorText
              ? "active:bg-transparent active:border-red !border-red box-shadow-red focus:ring-red"
              : "focus:ring-black focus:border-black border-black",
          )}
          {...props}
        />
        {errorText && (
          <div className={clsx("text-sm py-1 text-re")}>{errorText}</div>
        )}
      </div>
    )
  },
)
