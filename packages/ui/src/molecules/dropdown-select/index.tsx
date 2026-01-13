import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import useClickOutside from "@nfid/ui/utils/use-click-outside"
import { Input } from "../input"
import Arrow from "./arrow.svg"
import { DropdownOption } from "./option"

export interface IOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
  disabled?: boolean
}

export interface IDropdownSelect {
  label?: string
  bordered?: boolean
  options: IOption[]
  isSearch?: boolean
  selectedValues: string[]
  setSelectedValues: (value: string[]) => void
  placeholder?: string
  isMultiselect?: boolean
  firstSelected?: boolean
  disabled?: boolean
  showSelectAllOption?: boolean
  errorText?: string
}

export const DropdownSelect = ({
  label,
  options,
  bordered = true,
  isSearch = false,
  selectedValues,
  setSelectedValues,
  placeholder = "All",
  isMultiselect = true,
  firstSelected = false,
  disabled = false,
  showSelectAllOption = false,
  errorText,
}: IDropdownSelect) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const ref = useClickOutside(() => setIsDropdownOpen(false))

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [options, searchInput])

  const isAllSelected = useMemo(() => {
    return filteredOptions.length === selectedValues.length
  }, [filteredOptions, selectedValues])

  useEffect(() => {
    if (firstSelected && options.length) toggleCheckbox(false, options[0].value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstSelected, options])

  const toggleCheckbox = useCallback(
    (isChecked: boolean, value: string) => {
      const isChecking = !isChecked
      if (!isMultiselect) {
        setSelectedValues([value])
        return setIsDropdownOpen(false)
      }

      if (isChecking) setSelectedValues(selectedValues.concat([value]))
      else setSelectedValues(selectedValues.filter((v) => v !== value))
    },
    [isMultiselect, selectedValues, setSelectedValues],
  )

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) return setSelectedValues([])
    const allValues = filteredOptions.map((option) => option.value)
    setSelectedValues(allValues)
  }, [filteredOptions, setSelectedValues, isAllSelected])

  return (
    <div
      className={clsx(
        "relative w-full",
        disabled && "pointer-events-none cursor-default",
      )}
      ref={ref}
    >
      <label
        className={clsx(
          "text-xs tracking-[0.16px] leading-4 mb-1",
          "text-black",
        )}
      >
        {label}
      </label>
      <div
        className={clsx(
          "bg-white rounded-md h-10 p-2.5 w-full",
          "flex justify-between items-center",
          "cursor-pointer select-none",
          "active:outline active:outline-offset-1",
          bordered && "border border-black",
          isDropdownOpen && "border border-blue-600 bg-blue-50",
          disabled && "!border-none !bg-gray-100 !text-secondary",
          errorText && "!border border-red-600 !ring-2 !ring-red-100",
        )}
        style={{ boxShadow: isDropdownOpen ? "0px 0px 2px #0E62FF" : "" }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <p className={clsx("text-sm leading-5", !isMultiselect && "hidden")}>
          {selectedValues?.length
            ? `${selectedValues.length} selected`
            : placeholder}
        </p>
        <p className={clsx("text-sm leading-5", isMultiselect && "hidden")}>
          {selectedValues?.length
            ? options.find((o) => o.value === selectedValues[0])?.label
            : placeholder}
        </p>
        <img src={Arrow} alt="arrow" />
      </div>
      <p className={clsx("text-sm text-red-600")}>{errorText}</p>
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
              onKeyUp={(e) => setSearchInput(e.currentTarget.value)}
            />
          )}
          <div className={clsx("max-h-[30vh] overflow-auto flex flex-col")}>
            {showSelectAllOption && (
              <DropdownOption
                option={{ label: "Select all", value: "all" }}
                isChecked={isAllSelected}
                toggleCheckbox={toggleSelectAll}
                isCheckbox
              />
            )}
            {filteredOptions?.map((option) => (
              <DropdownOption
                key={option.value}
                option={option}
                isChecked={selectedValues.includes(option.value)}
                toggleCheckbox={toggleCheckbox}
                isCheckbox
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
