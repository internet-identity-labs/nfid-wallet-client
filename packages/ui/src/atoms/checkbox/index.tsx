import clsx from "clsx"

import { Label } from "@nfid/ui"

export interface ICheckbox {
  value: string
  isChecked: boolean
  onChange: (isChecked: boolean, value: string) => void
  className?: string
  labelText?: string
  labelClassName?: string
  overlayClassnames?: string
  id?: string
}

export const Checkbox = ({
  value,
  isChecked,
  onChange,
  className,
  labelText,
  labelClassName,
  overlayClassnames,
  id,
}: ICheckbox) => {
  return (
    <div className={clsx("flex items-center space-x-2", overlayClassnames)}>
      <input
        id={id}
        className={clsx(
          "rounded-[3px] h-[18px] w-[18px] border border-black",
          className,
        )}
        type="checkbox"
        checked={isChecked}
        onChange={() => onChange(isChecked, value)}
      />
      {labelText && (
        <Label
          id="checkbox_label"
          className={clsx("cursor-pointer", labelClassName)}
          htmlFor={id}
        >
          {labelText}
        </Label>
      )}
    </div>
  )
}
