import clsx from "clsx"

import { Image } from "@nfid-frontend/ui"

import { IOption } from "."
import { Checkbox } from "../checkbox"

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
      id={`option_${option.label.replace(/\s/g, "")}`}
      htmlFor={option.value}
      className={clsx(
        "py-2.5 hover:bg-gray-100 cursor-pointer px-[13px]",
        "flex items-center text-sm text-black",
        option.disabled && "pointer-events-none !text-gray-300",
      )}
    >
      <Checkbox
        value={option.value}
        isChecked={isChecked}
        onChange={toggleCheckbox}
        className={clsx("mr-[13px]", !isCheckbox && "hidden")}
        id={`option_cbx_${option.label.replace(/\s/g, "")}`}
      />
      {option.icon && (
        <Image
          className="mr-[13px] w-10 h-10 object-cover"
          src={option.icon}
          alt={option.value}
        />
      )}
      <span className="w-full">{option.label}</span>
      <span
        className="text-secondary whitespace-nowrap"
        id={`option_txs_${option.label.replace(/\s/g, "")}`}
      >
        {option.afterLabel}
      </span>
    </label>
  )
}
