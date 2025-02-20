import clsx from "clsx"
import React from "react"

import { Tooltip } from "@nfid-frontend/ui"

interface ToggleProps {
  onToggle: (state: boolean) => void
  isChecked?: boolean
  isDisabled?: boolean
  tooltip?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  onToggle,
  isChecked,
  isDisabled,
  tooltip,
}) => {
  const jsx = (
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
          "after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-black after:rounded-full after:h-[18px] after:w-[18px] after:transition-all",
          "peer-checked:bg-primaryButtonColor peer-checked:after:bg-white",
          "peer-checked:after:translate-x-full peer-checked:border-0 peer-checked:after:left-[8px]",
          isDisabled &&
            "!bg-gray-100 !border-gray-300 peer-checked:!bg-gray-300 after:!bg-gray-300 peer-checked:after:!bg-white",
        )}
      ></div>
    </label>
  )
  if (!tooltip) return jsx
  return <Tooltip tip={tooltip}>{jsx}</Tooltip>
}
