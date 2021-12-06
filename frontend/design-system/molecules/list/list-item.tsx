import React from "react"
import clsx from "clsx"
import { HiChevronRight } from "react-icons/hi"

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
      <div className="select-none cursor-pointer flex flex-wrap flex-1 items-center p-3 sm:p-4">
        {src && (
          <img
            alt={title}
            src={src}
            className="mx-auto object-contain rounded-full h-10 w-10 mr-4"
          />
        )}

        <div className="flex-1 pl-1 flex-shrink">
          <div className="font-medium text-gray-700 dark:text-white">
            {title}
          </div>

          {subtitle && (
            <div className="text-gray-600 dark:text-gray-200 text-sm">
              {subtitle}
            </div>
          )}
        </div>

        <button className="text-right justify-end">
          <HiChevronRight className="text-2xl text-gray-500 group-hover:text-gray-800" />
        </button>
      </div>
    </li>
  )
}
