import clsx from "clsx"
import { motion } from "framer-motion"
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
  }, [isDropdownOpen, setIsOpen])

  return (
    <div className={clsx("w-full")} ref={ref}>
      <div
        onClick={() => {
          if (!isDisabled) setIsDropdownOpen(!isDropdownOpen)
        }}
      >
        {triggerElement}
      </div>
      <>
        {isDropdownOpen && (
          <motion.div
            className={clsx(
              "right-[-10px]",
              "bg-white dark:bg-zinc-800 rounded-md mt-[1px] absolute z-[49] overflow-hidden",
              className,
            )}
            style={{
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
              transform:
                position === "top"
                  ? "translateY(calc(-100% - 27px))"
                  : undefined,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => setIsDropdownOpen(false)}
          >
            <div style={{ minWidth: `${minWidth}px` }}>{children}</div>
          </motion.div>
        )}
      </>
    </div>
  )
}
