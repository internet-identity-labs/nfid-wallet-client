import clsx from "clsx"
import React from "react"

interface ITab extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onClick?: () => void
}

const Tab: React.FC<ITab> = ({ isActive, onClick, children }) => {
  return (
    <div
      className={clsx(
        `pb-1.5 border-b-2 mr-0.5 cursor-pointer min-w-[150px]`,
        isActive ? "border-blue-600" : "border-black-base",
      )}
      onClick={onClick}
    >
      <div
        className={clsx(
          "font-bold",
          isActive ? "text-blue-600" : "text-black-base",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Tab
