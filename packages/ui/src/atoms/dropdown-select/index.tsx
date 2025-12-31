import clsx from "clsx"
import { motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { useDarkTheme } from "frontend/hooks"

import { Input } from "../../molecules/input"
import useClickOutside from "../../utils/use-click-outside"
import ArrowWhite from "./arrow-white.svg"
import Arrow from "./arrow.svg"
import { DropdownSelectOption } from "./option"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface IOption {
  label: string
  afterLabel?: string | number
  icon?: string | React.ComponentType<{ color?: string; size?: number }>
  value: string
  disabled?: boolean
  symbol?: string
  chainId?: ChainId
}

export interface IDropdownSelect {
  label?: string
  bordered?: boolean
  options: IOption[]
  isSearch?: boolean
  selectedValues: string[]
  setSelectedValues: (value: string[]) => void
  placeholder?: string
  placeholderIcon?: React.ComponentType<{ color?: string; size?: number }>
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
  placeholderIcon,
  isMultiselect = true,
  firstSelected = false,
  disabled = false,
  showSelectAllOption = false,
  errorText,
  id,
}: IDropdownSelect) => {
  const isDarkTheme = useDarkTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [openDirection, setOpenDirection] = useState<"top" | "bottom">("bottom")

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

  useEffect(() => {
    if (!isDropdownOpen) return

    const triggerRect = ref.current?.getBoundingClientRect()
    if (!triggerRect) return

    const dropdownHeight = 300
    const spaceBelow = window.innerHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setOpenDirection("top")
    } else {
      setOpenDirection("bottom")
    }
  }, [isDropdownOpen, ref])

  return (
    <div
      className={clsx(
        "relative w-full dark:bg-darkGray",
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
          "bg-white dark:bg-zinc-900 rounded-[12px] h-10 p-2.5 w-full flex justify-between items-center cursor-pointer select-none",
          bordered && "border border-black dark:border-zinc-500",
          isDropdownOpen &&
            "border border-teal-600 dark:border-teal-500 bg-teal-50/40",
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
          {selectedValues?.length ? (
            `${selectedValues.length} selected`
          ) : placeholderIcon ? (
            <div className="flex items-center gap-2.5">
              <div
                className={clsx(
                  "w-6 h-6 rounded-[8px]",
                  isDarkTheme ? "bg-[#141518]" : "white",
                )}
              >
                {(() => {
                  const Placeholder = placeholderIcon
                  return (
                    <Placeholder
                      color={isDarkTheme ? "white" : "black"}
                      size={24}
                    />
                  )
                })()}
              </div>
              {placeholder}
            </div>
          ) : (
            placeholder
          )}
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
        <img src={isDarkTheme ? ArrowWhite : Arrow} alt="arrow" />
      </div>
      {errorText && <p className="text-sm text-red-600">{errorText}</p>}
      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={clsx(
            "w-full bg-white dark:bg-darkGray rounded-[12px] absolute z-50 shadow-md",
            openDirection === "bottom"
              ? "top-full mt-[1px]"
              : "bottom-full mb-[1px]",
          )}
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
