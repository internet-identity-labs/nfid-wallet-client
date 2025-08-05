import clsx from "clsx"
import { HTMLAttributes } from "react"

interface IconButtonProps extends HTMLAttributes<HTMLDivElement> {
  id?: string
  img: React.ReactElement
  title?: string
  subtitle?: string
  onClick: React.MouseEventHandler
}

export const IconButton: React.FC<IconButtonProps> = ({
  id,
  img,
  title,
  subtitle,
  onClick,
  className,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={clsx(
        "flex items-center px-3 py-2 border border-gray-300 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-zinc-900 rounded-[12px]",
        "transition-all cursor-pointer w-full",
        className,
      )}
    >
      <div className="w-[28px] text-teal-600 dark:text-teal-500">{img}</div>
      {title && subtitle && (
        <div className={clsx("ml-[9px] text-current")}>
          <p className="text-sm text-black dark:text-white">{title}</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500">{subtitle}</p>
        </div>
      )}
    </div>
  )
}
