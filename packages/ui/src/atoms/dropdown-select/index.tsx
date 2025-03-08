import clsx from "clsx"
import { motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { Input } from "../../molecules/input"
import useClickOutside from "../../utils/use-click-outside"
import Arrow from "./arrow.svg"
import { DropdownSelectOption } from "./option"

export interface IOption {
  label: string
  afterLabel?: string | number
  icon?: string
  value: string
  disabled?: boolean
  symbol?: string
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
  id?: string
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
  id,
}: IDropdownSelect) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const ref = useClickOutside(() => setIsDropdownOpen(false))

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label?.toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [options, searchInput])

  const isAllSelected = useMemo(() => {
    if (filteredOptions.length === 1) return false
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
      {label && (
        <label className="text-xs tracking-[0.16px] leading-4 mb-1 text-black">
          {label}
        </label>
      )}
      <div
        className={clsx(
          "bg-white rounded-[12px] h-10 p-2.5 w-full flex justify-between items-center cursor-pointer select-none",
          bordered && "border border-black",
          isDropdownOpen && "border border-teal-600 bg-teal-50/40",
          disabled && "!border-none !bg-gray-100 !text-black",
          errorText && "!border border-red-600 !ring-2 !ring-red-100",
        )}
        style={{ boxShadow: isDropdownOpen ? "0px 0px 3px #0D9488" : "" }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        id={id}
      >
        <p
          className={clsx(
            "text-sm leading-5",
            (!isMultiselect || isAllSelected) && "hidden",
          )}
        >
          {selectedValues?.length
            ? `${selectedValues.length} selected`
            : placeholder}
        </p>
        <p
          className={clsx(
            "text-sm leading-5",
            (isMultiselect || isAllSelected) && "hidden",
          )}
        >
          {selectedValues?.length
            ? options.find((o) => o.value === selectedValues[0])?.label
            : placeholder}
        </p>
        <p className={clsx("text-sm leading-5", !isAllSelected && "hidden")}>
          All
        </p>
        <img src={Arrow} alt="arrow" />
      </div>
      {errorText && <p className="text-sm text-red-600">{errorText}</p>}
      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="w-full bg-white rounded-[12px] mt-[1px] absolute z-50 shadow-md"
        >
          {isSearch && (
            <Input
              type="text"
              icon={<IoIosSearch size="20" />}
              placeholder="Search"
              className="mx-[13px] mt-[13px]"
              onChange={(e) => setSearchInput(e.target.value)}
            />
          )}
          <div
            className="max-h-[288px] overflow-auto flex flex-col py-[12px]"
            id="dropdown-options"
          >
            {showSelectAllOption && (
              <DropdownSelectOption
                option={{ label: "Select all", value: "all" }}
                isChecked={isAllSelected}
                toggleCheckbox={toggleSelectAll}
                isCheckbox
              />
            )}
            {filteredOptions.map((option) => (
              <DropdownSelectOption
                key={option.value}
                option={option}
                isChecked={selectedValues.includes(option.value)}
                toggleCheckbox={toggleCheckbox}
                isCheckbox
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
