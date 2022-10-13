import clsx from "clsx"
import React from "react"

import iconClose from "./close.svg"

export interface IChip {
  onRemove?: (value: string) => void
  title: string
}

export const Chip: React.FC<IChip> = ({ onRemove, title }) => {
  if (!title?.length) return null

  return (
    <div
      className={clsx(
        "flex items-center space-x-1 pl-2 pr-0.5 py-0.5",
        "border border-black-base rounded-full",
        "w-max",
      )}
    >
      <span className="text-xs tracking-[0.16px]">{title}</span>
      <img
        onClick={() => onRemove && onRemove(title)}
        className={clsx(
          "block w-4 cursor-pointer",
          "hover:bg-gray-200 rounded-full",
        )}
        src={iconClose}
        alt=""
      />
    </div>
  )
}
