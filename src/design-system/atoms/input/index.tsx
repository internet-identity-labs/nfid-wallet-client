import clsx from "clsx"
import React, { ReactElement } from "react"

import { ErrorIcon } from "./icons/error"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prependedText?: string
  placeholder?: string
  type?: string
  icon?: ReactElement
  errorText?: string
  helperText?: string
  labelText?: string
  pin?: boolean
  small?: boolean
  isErrorStyles?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      children,
      className,
      prependedText,
      placeholder,
      type = "text",
      pin,
      icon,
      small,
      errorText,
      helperText,
      labelText,
      isErrorStyles,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <div className={clsx("rounded-md", className)}>
        {labelText && <Label>{labelText}</Label>}
        <div
          className={clsx(
            "flex relative",
            small && "md:max-w-[340px]",
            isErrorStyles && "border-[3px] border-red-100 rounded-[9px]",
          )}
        >
          {icon && (
            <div className="flex-shrink-0 absolute left-[10px] top-[12px] z-10">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={clsx(
              "flex-1 block w-full placeholder:text-sm border-black bg-transparent py-[10px]",
              "disabled:bg-gray-200 disabled:text-gray-900 disabled:border-none disabled:ring-transparent disabled:drop-shadow-none shadow-none placeholder:text-base",
              errorText || isErrorStyles
                ? "active:ring-4 active:ring-red-200 active:border-red-600 border-red-600 focus:border-red-600 focus:ring-red-600 active:bg-red-50"
                : "active:border-blue-600 active:ring-4 active:ring-blue-200 active:outline-none active:bg-blue-50",
              prependedText ? "rounded-r-md" : "rounded-md",
              icon && "pl-10",
              pin && "max-w-[45px] h-[60px] text-2xl md:text-3xl",
            )}
            placeholder={placeholder}
            ref={ref}
            {...inputProps}
          />

          {errorText && (
            <span className="absolute -translate-y-1/2 right-3 top-1/2">
              <ErrorIcon />
            </span>
          )}
        </div>

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
