import { HamburgerIcon } from "frontend/ui-utils/atoms/icons/hamburger"
import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  icon?: React.ReactNode
  title: string
  subtitle?: string
}

export const MenuItem: React.FC<Props> = ({ icon, title, subtitle }) => {
  return (
    <div
      className="flex items-center px-3 py-2 cursor-pointer space-x-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600"
      role="menuitem"
    >
      {icon && icon}
      <span className="flex flex-col">
        <span>{title}</span>
        {subtitle && <span className="text-gray-400 text-xs">{subtitle}</span>}
      </span>
    </div>
  )
}
