import clsx from "clsx"
import React, { ReactElement } from "react"

import { ErrorIcon } from "./icons/error"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string
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
  inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      children,
      className,
      inputClassName,
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
            id={id}
            type={type}
            className={clsx(
              "flex-1 block w-full placeholder:text-sm border-black-base bg-transparent py-[10px]",
              "disabled:bg-gray-200 disabled:text-gray-400 disabled:border-none disabled:ring-transparent disabled:drop-shadow-none shadow-none placeholder:text-base placeholder:text-gray-400",
              errorText || isErrorStyles
                ? "active:ring-4 active:ring-red-200 active:border-red-base border-red-base focus:border-red-base focus:ring-red-base active:bg-red-50"
                : "active:border-blue-base active:ring-4 active:ring-blue-200 active:outline-none active:bg-blue-50",
              prependedText ? "rounded-r-md" : "rounded-md",
              icon && "pl-10",
              pin && "max-w-[45px] h-[60px] text-2xl md:text-3xl",
              inputClassName,
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
          id={`${id}-error`}
          className={clsx(
            "text-sm py-1 text-gray-400",
            errorText && "!text-red-base",
          )}
        >
          {errorText ?? helperText}
        </div>
      </div>
    )
  },
)
