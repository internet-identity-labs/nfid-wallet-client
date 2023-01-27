import clsx from "clsx"
import { ReactElement } from "react"

import { ElementProps } from "frontend/types/react"

interface MethodRawProps extends ElementProps<HTMLElement> {
  img: ReactElement
  title: string
  subtitle: string
  onClick: React.MouseEventHandler
  id?: string
}

export const MethodRaw: React.FC<MethodRawProps> = ({
  img,
  title,
  subtitle,
  onClick,
  id,
  className,
}) => (
  <div
    id={id}
    onClick={onClick}
    className={clsx(
      "flex items-center w-full px-3 py-2 border border-gray-200 rounded-md",
      "hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]",
      className,
    )}
  >
    <div className="w-[28px] mr-[9px]">{img}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-secondary">{subtitle}</p>
    </div>
  </div>
)
