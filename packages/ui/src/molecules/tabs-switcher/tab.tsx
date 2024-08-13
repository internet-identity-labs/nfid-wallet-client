import clsx from "clsx"
import React from "react"

interface ITab extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onClick?: () => void
}

const Tab: React.FC<ITab> = ({ isActive, onClick, children, id }) => {
  return (
    <div
      className={clsx(
        `py-[10px] border-b-2 mr-0.5 cursor-pointer min-w-[150px]`,
        isActive ? "border-teal-600" : "border-black",
      )}
      onClick={onClick}
    >
      <div
        className={clsx("font-bold", isActive ? "text-teal-600" : "text-black")}
        id={`${id}`}
      >
        {children}
      </div>
    </div>
  )
}

export default Tab
