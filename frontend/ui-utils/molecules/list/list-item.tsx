import React from "react"
import clsx from "clsx"
import { CaretRightIcon } from "frontend/ui-utils/atoms/icons/caret/caret-right"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title: string
  subtitle?: string
  src?: string
}

export const ListItem: React.FC<Props> = ({
  children,
  className,
  title,
  subtitle,
  src,
}) => {
  return (
    <li className={clsx("flex flex-row group hover:bg-gray-50", className)}>
      <div className="select-none cursor-pointer flex flex-1 items-center p-4">
        {src && (
          <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
            <a href="#" className="block relative">
              <img
                alt={title}
                src={src}
                className="mx-auto object-contain rounded-full h-10 w-10 "
              />
            </a>
          </div>
        )}

        <div className="flex-1 pl-1 mr-16">
          <div className="font-medium text-gray-700 dark:text-white">{title}</div>

          {subtitle && (
            <div className="text-gray-600 dark:text-gray-200 text-sm">
              {subtitle}
            </div>
          )}
        </div>

        <button className="w-24 text-right flex justify-end">
          <CaretRightIcon />
        </button>
      </div>
    </li>
  )
}
