import React from "react"
import clsx from "clsx"
import { Label } from "components/atoms/input/label"

interface RadioButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLInputElement
  > {
  text?: string
  value?: string
  disabled?: boolean
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  children,
  className,
  text,
  value,
  disabled,
  ...props
}) => {
  return (
    <div className="flex items-center mb-2">
      <label className="inline-flex items-center">
        <input
          type="radio"
          disabled={disabled}
          name={text}
          value={value}
          className="h-5 w-5 hover:ring-2 hover:ring-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-black-base"
          {...props}
        />
        <Label className="ml-3 !mb-0">{text}</Label>
      </label>
    </div>
  )
}
