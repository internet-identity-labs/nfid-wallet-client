import React from "react"

import { isOdd } from "@nfid/utils"

import { ListItemVariant } from "./list-item-variant"

interface ListItemPlaceholderProps {
  index?: number
}

export const ListItemPlaceholder: React.FC<ListItemPlaceholderProps> = ({
  index,
}) => {
  return (
    <div className="flex flex-wrap items-center flex-1 select-none py-3">
      <div className="mr-4">
        <div className="relative flex items-center justify-center bg-gray-200 rounded-full w-10 h-10" />
      </div>

      <div className="relative flex items-center flex-1">
        <ListItemVariant isOdd={isOdd(index || 0)} />

        <div className="absolute left-0 w-full border-b -bottom-3"></div>
      </div>
    </div>
  )
}
