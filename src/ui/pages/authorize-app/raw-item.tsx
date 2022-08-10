import clsx from "clsx"

import { ElementProps } from "frontend/types/react"

interface RawItemProps extends ElementProps<HTMLDivElement> {
  title: string
}

export const AccountItem: React.FC<RawItemProps> = ({
  className,
  title,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "h-12 hover:bg-gray-100 transition-all cursor-pointer rounded-md",
        "flex justify-between items-center px-[10px] border-b border-gray-100",
        className,
      )}
    >
      <p className="text-sm">{title}</p>
      {/* <PencilIcon className="w-5 h-5" /> */}
    </div>
  )
}
