import React from "react"

import { isOdd } from "frontend/utils"

interface ListItemPlaceholderProps {
  index?: number
}

export const ListItemPlaceholder: React.FC<ListItemPlaceholderProps> = ({
  children,
  index,
}) => {
  const getVariant = () => {
    if (isOdd(index || 0)) {
      return (
        <div className="flex space-x-3">
          <div className="h-3 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-3 w-11 bg-gray-200 rounded-lg"></div>
          <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      )
    } else {
      return (
        <div className="flex space-x-3">
          <div className="h-3 w-28 bg-gray-200 rounded-lg"></div>
          <div className="h-3 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-wrap items-center flex-1 select-none py-3">
      <div className="mr-4">
        <div className="relative flex items-center justify-center bg-gray-200 rounded-full w-10 h-10" />
      </div>

      <div className="relative flex items-center flex-1">
        {getVariant()}

        <div className="absolute left-0 w-full border-b -bottom-3"></div>
      </div>
    </div>
  )
}
