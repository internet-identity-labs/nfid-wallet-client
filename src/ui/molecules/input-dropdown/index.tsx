import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

import useClickOutside from "frontend/ui/utils/use-click-outside"

import Arrow from "./arrow.svg"

export interface IOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
}

export interface IInputDropdown {
  label?: string
  bordered?: boolean
  options: IOption[]
  placeholder?: string
  value: () => string
  registerFunction: UseFormRegisterReturn<string>
  errorText?: string
  setValue: (value: string) => void
}

export const InputDropdown = ({
  label,
  options,
  bordered = true,
  placeholder = "",
  registerFunction,
  errorText,
  value,
  setValue,
}: IInputDropdown) => {
  const [selectedValue, setSelectedValue] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const ref = useClickOutside(() => setIsDropdownOpen(false))

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(value().toLowerCase()),
    )
  }, [options, value])

  useEffect(() => {
    if (selectedValue.length) setIsDropdownOpen(true)
    else setIsDropdownOpen(false)
  }, [selectedValue, value])

  return (
    <div className={clsx("relative w-full")} ref={ref}>
      <label
        className={clsx(
          "text-xs tracking-[0.16px] leading-4 mb-1",
          "text-black-base",
        )}
      >
        {label}
      </label>
      <label
        className={clsx(
          "bg-white rounded-md h-10 p-2.5 w-full pr-0",
          "flex justify-between items-center",
          "cursor-text select-none",
          "active:outline active:outline-offset-1",
          bordered && "border border-black-base",
          isDropdownOpen && "border border-blue-600 bg-blue-50",
        )}
        style={{ boxShadow: isDropdownOpen ? "0px 0px 2px #0E62FF" : "" }}
        htmlFor="input"
      >
        <input
          id="input"
          className={clsx("outline-none bg-transparent w-full", "text-sm")}
          placeholder={placeholder}
          onChangeCapture={(e: any) => setSelectedValue(e.target.value)}
          {...registerFunction}
        />

        <div
          className={clsx(
            "w-10 h-10 cursor-pointer hover:opacity-50",
            "flex items-center justify-center z-10",
          )}
          onClick={() => setIsDropdownOpen(true)}
        >
          <img src={Arrow} alt="arrow" />
        </div>
      </label>
      {isDropdownOpen && (
        <div
          className={clsx("w-full bg-white rounded-md mt-[1px] absolute z-50")}
          style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)" }}
        >
          <div className={clsx("max-h-[30vh] overflow-auto flex flex-col")}>
            {filteredOptions?.map((option) => (
              <label
                key={`option_${option.value}`}
                htmlFor={option.value}
                className={clsx(
                  "py-2.5 hover:bg-gray-100 cursor-pointer px-[13px]",
                  "flex items-center text-sm text-black-base",
                )}
                onClick={() => {
                  setValue(option.value)
                  setIsDropdownOpen(false)
                }}
              >
                {option.icon && (
                  <img
                    className="mr-[13px] w-10 h-10 object-cover"
                    src={option.icon}
                    alt={option.value}
                  />
                )}
                <span className="w-full">{option.label}</span>
                <span className="text-gray-400 ">{option.afterLabel}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className={clsx("text-sm py-1 text-gray-400", "!text-red-base")}>
        {errorText}
      </div>
    </div>
  )
}
