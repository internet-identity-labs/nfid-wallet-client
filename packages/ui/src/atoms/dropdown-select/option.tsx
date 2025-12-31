import clsx from "clsx"

import { IOption } from "."
import { Checkbox } from "../checkbox"
import { IconNftPlaceholder } from "../icons"
import ImageWithFallback from "../image-with-fallback"
import { useDarkTheme } from "frontend/hooks"
import { NetworkIcon } from "../../utils/network-icon"

export interface IDropdownSelectOption {
  option: IOption
  isChecked: boolean
  toggleCheckbox: (isChecked: boolean, value: string) => void
  isCheckbox: boolean
}

export const DropdownSelectOption = ({
  option,
  isChecked,
  toggleCheckbox,
  isCheckbox,
}: IDropdownSelectOption) => {
  const isDarkTheme = useDarkTheme()
  const checkboxId = `option_cbx_${option.value.replace(/[^a-zA-Z0-9]/g, "_")}`

  return (
    <label
      key={`option_${option.value}`}
      id={`option_${option.value.replace(/[^a-zA-Z0-9]/g, "_")}`}
      htmlFor={checkboxId}
      className={clsx(
        "py-2.5 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-700 cursor-pointer px-[13px]",
        "flex items-center text-sm text-black",
        option.disabled && "pointer-events-none !text-gray-300",
      )}
    >
      <Checkbox
        value={option.value}
        isChecked={isChecked}
        onChange={toggleCheckbox}
        className={clsx(
          "mr-[13px]",
          !isCheckbox && "hidden",
          "dark:bg-zinc-900 dark:border-zinc-500",
          "hover:border-teal-600 dark:hover:border-teal-600 hover:outline-[#0D948833] hover:outline outline-2",
          isChecked && "dark:!bg-teal-600 dark:!border-teal-600",
        )}
        id={checkboxId}
      />
      {option.icon !== undefined &&
        (typeof option.icon === "string" ? (
          <div className="relative mr-[10px]">
            <ImageWithFallback
              alt={option.label}
              fallbackSrc={IconNftPlaceholder}
              src={`${option.icon}`}
              className="object-cover w-10 h-10 rounded-full bg-gray-50"
            />
            <div className="absolute bottom-[-5px] right-[-5px] sm:bottom-0 sm:right-0 w-[18px] h-[18px] rounded-[6px] bg-white dark:bg-zinc-800">
              <NetworkIcon chainId={option.chainId!} />
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "w-6 h-6 rounded-[8px] mr-2.5",
              isDarkTheme ? "bg-[#141518]" : "white",
            )}
          >
            <option.icon size={24} color={isDarkTheme ? "white" : "black"} />
          </div>
        ))}
      <div>
        <span className="block text-sm leading-[26px]">{option.symbol}</span>
        <span className="block text-xs leading-[20px] dark:text-white">
          {option.label}
        </span>
      </div>
      <span
        className="text-secondary whitespace-nowrap"
        id={`option_txs_${option.label.replace(/\s/g, "")}`}
      >
        {option.afterLabel}
      </span>
    </label>
  )
}
