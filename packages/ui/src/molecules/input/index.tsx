import clsx from "clsx"
import React, { ReactElement } from "react"

import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string
  placeholder?: string
  type?: string
  icon?: ReactElement
  errorText?: string
  helperText?: string | JSX.Element
  labelText?: string
  pin?: boolean
  small?: boolean
  isErrorStyles?: boolean
  inputClassName?: string
  disabled?: boolean
  innerText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      children,
      className,
      inputClassName,
      placeholder,
      type = "text",
      pin,
      icon,
      small,
      errorText,
      helperText,
      labelText,
      isErrorStyles,
      innerText,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <div className={clsx("rounded-[12px]", className)}>
        {labelText && (
          <Label
            className={clsx(
              "text-xs mb-1 inline-block",
              inputProps.disabled && "!text-secondary",
            )}
          >
            {labelText}
          </Label>
        )}
        <div className={clsx("flex relative", small && "md:max-w-[340px]")}>
          {icon && (
            <div
              className={clsx(
                "flex-shrink-0 absolute left-2 top-1/2 -translate-y-1/2 z-10",
                inputProps.disabled && "text-secondary",
              )}
            >
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={clsx(
              "flex-1 block w-full py-[7px]",
              "placeholder:text-gray-400 placeholder:text-sm",
              "disabled:bg-gray-200 disabled:text-secondary disabled:drop-shadow-none shadow-none",
              "border-1 border-gray-400 disabled:border-gray-200",
              "rounded-[12px]",
              errorText || isErrorStyles
                ? clsx(
                    "border-red-600 active:border-red-600 focus:border-red-600 ",
                    "active:bg-red-50",
                    "ring-red-100 focus:ring-[3px] active:ring-red-200 focus:ring-red-200 focus-within:ring-red-100 ",
                  )
                : clsx(
                    "focus:ring-[3px] active:ring-teal-600/40 focus:ring-teal-600/40 focus:border-teal-600 active:border-teal-600 active:bg-teal-50/40",
                  ),
              icon && "pl-9",
              pin && "max-w-[45px] h-[60px] text-2xl md:text-3xl",
              inputClassName,
            )}
            placeholder={placeholder}
            ref={ref}
            {...inputProps}
          />

          <span
            className={clsx(
              "absolute right-0 h-full -translate-y-1/2 top-1/2",
              "items-center flex",
            )}
          >
            {innerText && (
              <div
                className={clsx(
                  "bg-black bg-opacity-[0.04] h-full px-3 rounded-r-md",
                  "flex items-center flex-shrink-0",
                  "text-sm text-secondary",
                )}
              >
                {innerText}
              </div>
            )}
          </span>
        </div>

        {errorText && (
          <div
            id={`${id}-error`}
            className={clsx("mt-1 text-xs text-red-base text-red-600")}
          >
            {errorText}
          </div>
        )}
        {helperText && !errorText && (
          <div
            id={`${id}-helper`}
            className={clsx("mt-1 text-xs text-secondary")}
          >
            {helperText}
          </div>
        )}
      </div>
    )
  },
)
