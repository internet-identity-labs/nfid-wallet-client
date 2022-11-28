import clsx from "clsx"
import React, { ReactElement } from "react"

import { IconCmpError } from "../../atoms/icons"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string
  placeholder?: string
  type?: string
  icon?: ReactElement
  errorText?: string
  helperText?: string
  labelText?: string
  pin?: boolean
  small?: boolean
  isErrorStyles?: boolean
  inputClassName?: string
  disabled?: boolean
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
      ...inputProps
    },
    ref,
  ) => {
    return (
      <div className={clsx("rounded-md", className)}>
        {labelText && (
          <Label
            className={clsx("text-xs", inputProps.disabled && "!text-gray-400")}
          >
            {labelText}
          </Label>
        )}
        <div className={clsx("flex relative", small && "md:max-w-[340px]")}>
          {icon && (
            <div
              className={clsx(
                "flex-shrink-0 absolute left-2 top-1/2 -translate-y-1/2 z-10",
                inputProps.disabled && "text-gray-400",
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
              "disabled:bg-gray-200 disabled:text-gray-400 disabled:drop-shadow-none shadow-none",
              "border-1 disabled:border-gray-200",
              "rounded-md",
              errorText || isErrorStyles
                ? clsx(
                    "border-red-600 active:border-red-600 focus:border-red-600 ",
                    "active:bg-red-50",
                    "ring-red-100 focus:ring-[3px] active:ring-red-200  focus:ring-red-200 focus-within:ring-red-100 ",
                  )
                : clsx(
                    "focus:ring-[3px] active:ring-blue-200 focus:ring-blue-200 active:border-blue-base active:bg-blue-50",
                  ),
              icon && "pl-9",
              pin && "max-w-[45px] h-[60px] text-2xl md:text-3xl",
              inputClassName,
            )}
            placeholder={placeholder}
            ref={ref}
            {...inputProps}
          />

          {errorText && (
            <span className="absolute -translate-y-1/2 right-2 top-1/2">
              <IconCmpError className="text-red-600" />
            </span>
          )}
        </div>

        {errorText && (
          <div
            id={`${id}-error`}
            className={clsx("mt-1 text-xs text-red-base")}
          >
            {errorText}
          </div>
        )}
        {helperText && !errorText && (
          <div
            id={`${id}-helper`}
            className={clsx("mt-1 text-xs text-gray-400")}
          >
            {helperText}
          </div>
        )}
      </div>
    )
  },
)
