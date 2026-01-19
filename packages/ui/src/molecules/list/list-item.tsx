import clsx from "clsx"
import React from "react"

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string | React.ReactNode
  disabled?: boolean
  onClick?: () => void
  id?: string
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  disabled = false,
  onClick,
  id,
  className,
  ...props
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "flex items-center py-3 px-4 border-b border-gray-200 dark:border-zinc-700",
        !disabled &&
          onClick &&
          "cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      {...props}
    >
      {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
      <div className="flex-1 text-sm dark:text-white">{title}</div>
    </div>
  )
}
