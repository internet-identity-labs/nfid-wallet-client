import clsx from "clsx"
import { is } from "date-fns/locale"
import React from "react"

interface ToggleProps {
  onToggle: (state: boolean) => void
  isChecked?: boolean
  isDisabled?: boolean
}

export const Toggle: React.FC<ToggleProps> = ({
  onToggle,
  isChecked,
  isDisabled,
}) => {
  return (
    <label
      className={clsx(
        "relative inline-flex items-center cursor-pointer",
        isDisabled && "pointer-events-none",
      )}
    >
      <input
        type="checkbox"
        onChange={(e) => onToggle(e.target.checked)}
        checked={isChecked}
        className="sr-only peer"
      />
      <div
        className={clsx(
          "w-12 h-6 bg-white peer-focus:outline-none rounded-full peer border border-black",
          "after:content-[''] after:absolute after:top-0.5 after:left-[3px] after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all",
          "peer-checked:bg-blue peer-checked:after:bg-white",
          "peer-checked:after:translate-x-full peer-checked:border-0 peer-checked:after:left-[6px]",
          isDisabled &&
            "!bg-gray-100 !border-gray-300 peer-checked:!bg-gray-300 after:!bg-gray-300",
        )}
      ></div>
    </label>
  )
}
