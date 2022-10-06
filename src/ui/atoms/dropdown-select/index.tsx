import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import useClickOutside from "frontend/ui/utils/use-click-outside"

import { Checkbox } from "../checkbox"
import { Input } from "../input"
import Arrow from "./arrow.svg"

export interface IOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
}

export interface IDropdownSelect {
  label?: string
  bordered?: boolean
  options: IOption[]
  isSearch?: boolean
  onChange: (values: string[]) => void
}

export const DropdownSelect = ({
  label,
  options,
  bordered = true,
  isSearch = false,
  onChange,
}: IDropdownSelect) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(true)
  const [searchInput, setSearchInput] = useState("")

  const ref = useClickOutside(() => setIsDropdownOpen(false))

  const toggleCheckbox = (isChecked: boolean, value: string) => {
    const isChecking = !isChecked
    if (isChecking) setSelectedValues(selectedValues.concat([value]))
    else setSelectedValues(selectedValues.filter((v) => v !== value))
  }

  const filteredOptions = useMemo(() => {
    return options.filter((option) => option.label.includes(searchInput))
  }, [options, searchInput])

  useEffect(() => {
    onChange(selectedValues)
  }, [onChange, selectedValues])

  return (
    <div className={clsx("relative w-full")} ref={ref}>
      <label className={clsx("text-xs tracking-[0.16px] leading-4 mb-1")}>
        {label}
      </label>
      <div
        className={clsx(
          "bg-white rounded-md h-10 p-2.5 w-full",
          "flex justify-between items-center",
          "cursor-pointer select-none",
          "active:outline active:outline-offset-1",
          bordered && "border border-black-base",
          isDropdownOpen && "border border-blue-600 bg-blue-50",
        )}
        style={{ boxShadow: isDropdownOpen ? "0px 0px 2px #0E62FF" : "" }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <p className={clsx("text-sm leading-5")}>
          {selectedValues.length ? `${selectedValues.length} selected` : "All"}
        </p>
        <img src={Arrow} alt="arrow" />
      </div>
      {isDropdownOpen && (
        <div
          className={clsx("w-full bg-white rounded-md mt-[1px] absolute z-50")}
          style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)" }}
        >
          {isSearch && (
            <Input
              type="text"
              icon={<IoIosSearch size="20" />}
              placeholder="Search"
              className="mx-[13px] mt-[13px]"
              onKeyUp={(e) => setSearchInput(e.target.value)}
            />
          )}
          <div className={clsx("max-h-[40vh] overflow-auto flex flex-col")}>
            {filteredOptions?.map((option) => (
              <label
                key={`option_${option.value}`}
                htmlFor={option.value}
                className={clsx(
                  "py-2.5 hover:bg-gray-100 cursor-pointer px-[13px]",
                  "flex items-center text-sm",
                )}
              >
                <Checkbox
                  value={option.value}
                  isChecked={selectedValues.includes(option.value)}
                  onChange={toggleCheckbox}
                />
                {option.icon && (
                  <img
                    className="ml-[13px] w-10 h-10 object-cover"
                    src={option.icon}
                    alt={option.value}
                  />
                )}
                <span className="ml-[13px] w-full">{option.label}</span>
                <span className="text-gray-400 ">{option.afterLabel}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
