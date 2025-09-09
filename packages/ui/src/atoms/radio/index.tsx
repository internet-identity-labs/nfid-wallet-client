import clsx from "clsx"
import React from "react"

import { Label } from "../../molecules/input/label"

export interface RadioButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  text?: string
  value?: string
  disabled?: boolean
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  children,
  className,
  text,
  value,
  name,
  disabled,
  onClick,
  id,
  ...props
}) => {
  return (
    <div className="flex items-center" onClick={onClick}>
      <div className="inline-flex items-center">
        <input
          type="radio"
          disabled={disabled}
          id={id}
          name={name}
          value={value}
          className={clsx(
            "w-5 h-5 cursor-pointer",
            disabled
              ? "!border-gray-300 !pointer-events-none"
              : "hover:ring-2 hover:ring-teal-600/20 hover:border-teal-600 focus:ring-0 focus:ring-offset-0 focus:ring-black active:ring-2 active:ring-offset-2 active:ring-black",
          )}
          {...props}
        />
        {text && (
          <Label
            htmlFor={id}
            className="ml-3 !mb-0 cursor-pointer dark:text-white"
          >
            {text}
          </Label>
        )}
      </div>
    </div>
  )
}
