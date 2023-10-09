import clsx from "clsx"
import React from "react"

import logo from "../../assets/id.svg"

interface SDKHeaderProps {
  frameLabel: string
}

export const SDKHeader: React.FC<SDKHeaderProps> = ({ frameLabel }) => {
  return (
    <div
      className={clsx(
        "border-b border-gray-100 mt-1 py-3 px-5 space-x-2",
        "flex items-center",
        "sm:border-x",
      )}
    >
      <img src={logo} alt="logo" />
      <span className="text-xs text-gray-600">{frameLabel}</span>
    </div>
  )
}
