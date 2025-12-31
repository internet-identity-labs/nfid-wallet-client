import clsx from "clsx"
import React from "react"

import { Label } from "@nfid-frontend/ui"

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
      children: _children,
      className,
      labelText,
      rows = 3,
      helperText: _helperText,
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
            "shadow-sm text-black dark:text-white block w-full text-sm border rounded-[12px] bg-transparent resize-none dark:bg-[#FFFFFF0D]",
            errorText
              ? "active:bg-transparent active:border-red !border-red box-shadow-red focus:ring-red"
              : "focus:ring-black focus:border-black border-black dark:border-zinc-500",
          )}
          {...props}
        />
        {errorText && (
          <div className={clsx("text-sm py-1 text-red-600 dark:text-red-500")}>
            {errorText}
          </div>
        )}
      </div>
    )
  },
)
