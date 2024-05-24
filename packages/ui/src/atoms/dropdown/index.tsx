import clsx from "clsx"
import { useState } from "react"

import useClickOutside from "../../utils/use-click-outside"

export interface IDropdown {
  triggerElement?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export const Dropdown = ({
  triggerElement,
  className,
  children,
}: IDropdown) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const ref = useClickOutside(() => setIsDropdownOpen(false))

  return (
    <div className={clsx("relative w-full")} ref={ref}>
      <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {triggerElement}
      </div>
      {isDropdownOpen && (
        <div
          className={clsx(
            `${
              className ?? "right-[-10px]"
            } bg-white rounded-md mt-[1px] absolute z-[49]`,
          )}
          style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)" }}
        >
          <div className="min-w-[210px] sm:min-w-[250px]">{children}</div>
        </div>
      )}
    </div>
  )
}
