import clsx from "clsx"
import React from "react"

import { Tooltip } from "@nfid/ui"

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
          "w-12 h-6 bg-white dark:bg-transparent peer-focus:!outline-black dark:peer-focus:!outline-white peer-focus:outline-2 peer-focus:!outline-offset-2 rounded-full peer border border-black dark:border-white",
          "outline outline-2 outline-transparent hover:outline-[#0D948833] dark:hover:outline-[#2DD4BF4D] transition-all hover:border-gray-700 dark:hover:border-zinc-300",
          "after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-black hover:after:bg-gray-700 dark:hover:after:bg-zinc-300 dark:after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all",
          "peer-checked:bg-primaryButtonColor hover:peer-checked:bg-teal-600 peer-checked:after:bg-white dark:peer-checked:hover:after:bg-white",
          "peer-checked:after:translate-x-full peer-checked:border-0 peer-checked:after:left-[8px]",
          isDisabled &&
            "!bg-gray-100 dark:!bg-transparent !bg-gray-100 !border-gray-300 dark:!border-zinc-600 dark:peer-checked:!border peer-checked:!bg-gray-300 dark:peer-checked:!bg-transparent after:!bg-gray-300 dark:after:!bg-zinc-600 peer-checked:after:!bg-white dark:peer-checked:after:!bg-zinc-600 !outline-transparent",
        )}
      ></div>
    </label>
  )
  if (!tooltip) return jsx
  return <Tooltip tip={tooltip}>{jsx}</Tooltip>
}
