import clsx from "clsx"
import React, { HTMLAttributes, ReactElement } from "react"

export interface IItem {
  icon: ReactElement
  text: string
  onClick?: () => void
}

interface PopoverToolsProps extends HTMLAttributes<HTMLDivElement> {
  items: IItem[]
}

export const PopoverTools: React.FC<PopoverToolsProps> = ({
  children,
  items,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-md shadow-md",
        "w-40 text-sm",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={`popover_item_${i}`}
          className={clsx(
            "flex items-center cursor-pointer hover:bg-gray-100",
            "px-2.5 py-2 space-x-1.5",
            i === 0 && "rounded-t-md",
            i === items.length - 1 && "rounded-b-md",
          )}
          onClick={item.onClick}
        >
          <div className="w-6">{item.icon}</div>
          <span>{item.text}</span>
        </div>
      ))}
      {children}
    </div>
  )
}
