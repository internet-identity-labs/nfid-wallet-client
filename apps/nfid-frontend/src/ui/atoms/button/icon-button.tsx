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
        "flex items-center px-3 py-2 bg-gray-50 border border-gray-100 rounded-md",
        "hover:text-black text-gray-400 transition-all cursor-pointer w-full",
        className,
      )}
    >
      <div className="w-[28px] text-current">{img}</div>
      {title && subtitle && (
        <div className={clsx("ml-[9px] text-current")}>
          <p className="text-sm">{title}</p>
          <p className="text-xs">{subtitle}</p>
        </div>
      )}
    </div>
  )
}
