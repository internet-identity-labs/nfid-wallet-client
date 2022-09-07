import clsx from "clsx"
import React from "react"

interface IPaginationBox extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
}

const PaginationBox: React.FC<IPaginationBox> = ({
  children,
  isActive,
  onClick,
  disabled,
  className,
}) => {
  return (
    <div
      className={clsx(
        "w-12 h-12 flex items-center justify-center",
        isActive
          ? "bg-gray-200 rounded-[6px]"
          : "hover:bg-gray-100  cursor-pointer",
        disabled && "pointer-events-none",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default PaginationBox
