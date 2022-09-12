import clsx from "clsx"
import React from "react"

interface IProfileSidebarItem extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string
  title: string
  onClick?: () => void
  isActive?: boolean
}

const ProfileSidebarItem: React.FC<IProfileSidebarItem> = ({
  icon,
  title,
  onClick,
  className,
  isActive,
}) => {
  return (
    <div
      className={clsx(
        "h-[50px] flex space-x-2.5 px-2.5 items-center rounded-[4px]",
        "hover:bg-gray-100 transition-colors cursor-pointer",
        isActive && "bg-gray-100",
      )}
      onClick={onClick}
    >
      <div
        className={clsx("w-6 h-6", isActive ? "bg-blue-600" : "bg-gray-700")}
        style={{
          mask: `url(${icon})`,
          WebkitMask: `url(${icon})`,
        }}
      />
      <span
        className={clsx(className ?? "text-sm font-semibold text-gray-700")}
      >
        {title}
      </span>
    </div>
  )
}

export default ProfileSidebarItem
