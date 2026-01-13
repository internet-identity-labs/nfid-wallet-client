import clsx from "clsx"
import React from "react"

import { ListItemChevron } from "./icons/chevron"

interface Props {
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  title: JSX.Element | string
  subtitle?: string | React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  disabled?: boolean
  id?: string
}

export const ListItem: React.FC<Props> = ({
  className,
  title,
  subtitle,
  icon,
  action,
  onClick,
  disabled,
  id,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative flex flex-row hover:bg-gray-50 hover:rounded transition-colors duration-100 -mx-3",
        "h-[60px] border-b border-gray-200",
        className,
        disabled && "pointer-events-none",
      )}
    >
      <div className="flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer">
        {icon && (
          <div className="mr-4">
            <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
              {icon}
            </div>
          </div>
        )}

        <div className="relative flex items-center flex-1">
          <div className="flex-1 flex-shrink">
            <div
              id={id}
              className={clsx(disabled ? "text-secondary" : "text-gray-700")}
            >
              {title}
            </div>
            {subtitle && (
              <div className="my-1 text-sm text-secondary">{subtitle}</div>
            )}
          </div>

          <div
            className={clsx(
              "pl-1 md:pl-4 flex items-center",
              disabled && "hidden",
            )}
          >
            {action ? (
              action
            ) : (
              <button className="text-right">
                <ListItemChevron />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
