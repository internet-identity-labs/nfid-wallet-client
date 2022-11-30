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
        "flex items-center px-3 py-2 border border-gray-300 rounded-md",
        "hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]",
        "w-full max-w-[400px]",
        className,
      )}
    >
      <div className="w-[28px]">{img}</div>
      {title && subtitle && (
        <div className={clsx("ml-[9px]")}>
          <p className="text-sm">{title}</p>
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        </div>
      )}
    </div>
  )
}
