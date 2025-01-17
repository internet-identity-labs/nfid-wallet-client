import clsx from "clsx"
import { useEffect, useState } from "react"

import useClickOutside from "../../utils/use-click-outside"

export type IDropdownPosition = "top" | "bottom"

export interface IDropdown {
  triggerElement?: React.ReactNode
  className?: string
  children: React.ReactNode
  setIsOpen?: (v: boolean) => void
  minWidth?: number
  position?: IDropdownPosition
  isDisabled?: boolean
}

export const Dropdown = ({
  triggerElement,
  className,
  children,
  setIsOpen,
  minWidth = 210,
  position = "bottom",
  isDisabled = false,
}: IDropdown) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const ref = useClickOutside(() => setIsDropdownOpen(false))

  useEffect(() => {
    if (!setIsOpen) return
    setIsOpen(isDropdownOpen)
  }, [isDropdownOpen])

  return (
    <div className={clsx("w-full")} ref={ref}>
      <div
        onClick={() => {
          if (!isDisabled) setIsDropdownOpen(!isDropdownOpen)
        }}
      >
        {triggerElement}
      </div>
      {isDropdownOpen && (
        <div
          className={clsx(
            "right-[-10px]",
            "bg-white rounded-md mt-[1px] absolute z-[49]",
            className,
          )}
          style={{
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
            transform: position === "top" ? "translateY(calc(-100% - 27px))" : undefined,
          }}
          onClick={() => setIsDropdownOpen(false)}
        >
          <div style={{ minWidth: `${minWidth}px` }}>{children}</div>
        </div>
      )}
    </div>
  )
}
