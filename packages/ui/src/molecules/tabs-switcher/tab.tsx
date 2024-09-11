import clsx from "clsx"
import React from "react"

interface ITab extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onClick?: () => void
  length: number
}

const Tab: React.FC<ITab> = ({ isActive, onClick, children, id, length }) => {
  const getWidth = () => {
    if (length > 0) {
      return `${(100 / length).toFixed(2)}%`
    }
    return "auto"
  }
  return (
    <div
      className={clsx(
        "py-[10px] border-b-2 mr-0.5 cursor-pointer",
        `flex-shrink-0 sm:min-w-[150px] sm:!w-auto`,
        isActive ? "border-teal-600" : "border-black",
        !isActive && "hover:border-gray-500 hover:text-gray-500",
      )}
      onClick={onClick}
      style={{ width: getWidth() }}
    >
      <div
        className={clsx(
          "font-bold flex gap-[8px] items-center text-[20px]",
          isActive && "text-teal-600",
        )}
        id={`${id}`}
      >
        {children}
      </div>
    </div>
  )
}

export default Tab
