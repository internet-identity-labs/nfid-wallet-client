import clsx from "clsx"
import React from "react"

interface IProfileSidebarItem extends React.HTMLAttributes<HTMLDivElement> {
  icon?: any
  title: string
  isActive?: boolean
}

export const SidebarItem: React.FC<IProfileSidebarItem> = ({
  icon,
  title,
  onClick: _onClick,
  className,
  isActive,
  id,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "h-[50px] flex items-center space-x-2.5 px-2.5 rounded-[4px]",
        "hover:bg-gray-100 transition-colors cursor-pointer",
        "md:w-[50px] md:justify-center",
        "lg:w-auto lg:justify-start",
        isActive && "bg-gray-100",
      )}
    >
      <div>
        {icon
          ? React.cloneElement(icon, {
              className: isActive ? "text-blue" : "text-gray-700",
            })
          : null}
      </div>
      <span
        className={clsx(
          className ?? "text-sm font-semibold text-gray-700",
          "sm:block md:hidden lg:block",
        )}
      >
        {title}
      </span>
    </div>
  )
}
