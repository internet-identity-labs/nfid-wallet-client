import clsx from "clsx"

import { Label } from "@nfid-frontend/ui"

export interface ICheckbox {
  value: string
  isChecked: boolean
  onChange: (isChecked: boolean, value: string) => void
  className?: string
  labelText?: string
}

export const Checkbox = ({
  value,
  isChecked,
  onChange,
  className,
  labelText,
}: ICheckbox) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        className={clsx(
          "rounded-[3px] h-[18px] w-[18px] border border-black-base",
          className,
        )}
        type="checkbox"
        id={value}
        checked={isChecked}
        onChange={() => onChange(isChecked, value)}
      />
      {labelText && (
        <Label className="cursor-pointer" htmlFor={value}>
          {labelText}
        </Label>
      )}
    </div>
  )
}
