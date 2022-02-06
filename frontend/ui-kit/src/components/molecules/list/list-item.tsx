import React from "react"
import clsx from "clsx"
import { HiChevronRight } from "react-icons/hi"
import { ListItemChevron } from "./icons/chevron"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title: string
  subtitle?: string | React.ReactNode
  src?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const ListItem: React.FC<Props> = ({
  children,
  className,
  title,
  subtitle,
  src,
  icon,
  action,
}) => {
  return (
    <li
      className={clsx(
        "flex flex-row hover:bg-gray-200 hover:rounded transition-colors duration-100",
        className,
      )}
    >
      <div className="select-none cursor-pointer flex flex-wrap flex-1 items-center p-3 sm:p-4">
        {src && (
          <img
            alt={title}
            src={src}
            className="mx-auto object-contain rounded-full h-10 w-10 mr-4"
          />
        )}

        {icon && (
          <div className="mr-4">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white">
              {icon}
            </div>
          </div>
        )}

        <div className="flex flex-1 items-center relative">
          <div className="flex-1 pl-1 flex-shrink">
            <div className="text-gray-700">{title}</div>
            {subtitle && (
              <div className="text-gray-400 text-sm my-1">{subtitle}</div>
            )}
          </div>

          <div className="px-1 md:px-4">
            {action ? (
              action
            ) : (
              <button className="text-right">
                <ListItemChevron />
              </button>
            )}
          </div>

          <div className="absolute border-b w-full -bottom-3 left-0"></div>
        </div>
      </div>
    </li>
  )
}
