import clsx from "clsx"

import { IOption } from "."
import { Checkbox } from "../../atoms/checkbox"

export interface IDropdownOption {
  option: IOption
  isChecked: boolean
  toggleCheckbox: (isChecked: boolean, value: string) => void
  isCheckbox: boolean
}

export const DropdownOption = ({
  option,
  isChecked,
  toggleCheckbox,
  isCheckbox,
}: IDropdownOption) => {
  return (
    <label
      key={`option_${option.value}`}
      htmlFor={option.value}
      className={clsx(
        "py-2.5 hover:bg-gray-100 cursor-pointer px-[13px]",
        "flex items-center text-sm text-black-base",
        option.disabled && "pointer-events-none !text-gray-300",
      )}
    >
      <Checkbox
        value={option.value}
        isChecked={isChecked}
        onChange={toggleCheckbox}
        className={clsx("mr-[13px]", !isCheckbox && "hidden")}
      />
      {option.icon && (
        <img
          className="mr-[13px] w-10 h-10 object-cover"
          src={option.icon}
          alt={option.value}
        />
      )}
      <span className="w-full">{option.label}</span>
      <span className="text-gray-400 whitespace-nowrap">
        {option.afterLabel}
      </span>
    </label>
  )
}
