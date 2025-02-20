import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
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
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className={clsx(
              "right-[-10px]",
              "bg-white rounded-md mt-[1px] absolute z-[49]",
              className,
            )}
            style={{
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
            }}
            initial={{ y: position === "top" ? -10 : 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position === "top" ? -10 : 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setIsDropdownOpen(false)}
          >
            <div style={{ minWidth: `${minWidth}px` }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
