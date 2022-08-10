import React from "react"

import { ElementProps } from "frontend/types/react"

interface ListItemVariantProps extends ElementProps<HTMLDivElement> {
  isOdd: boolean
}

export const ListItemVariant: React.FC<ListItemVariantProps> = ({
  children,
  className,
  isOdd,
}) => {
  return isOdd ? (
    <div className="flex space-x-3">
      <div className="h-3 w-20 bg-gray-200 rounded-lg"></div>
      <div className="h-3 w-11 bg-gray-200 rounded-lg"></div>
      <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
    </div>
  ) : (
    <div className="flex space-x-3">
      <div className="h-3 w-28 bg-gray-200 rounded-lg"></div>
      <div className="h-3 w-20 bg-gray-200 rounded-lg"></div>
    </div>
  )
}
