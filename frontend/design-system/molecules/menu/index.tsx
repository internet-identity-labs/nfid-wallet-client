import React, { useState } from "react"
import { MenuItem } from "./menu-item"
import { HiCheck, HiChevronDown, HiMenu } from "react-icons/hi"
interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
}

export const DropdownMenu: React.FC<Props> = ({
  children,
  title = "Choose an option",
}) => {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setShowDialog(!showDialog)}
        className="border border-gray-300 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none"
      >
        {title}
        <HiChevronDown className="ml-3 text-lg" />
      </button>

      {showDialog && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div
            className="py-1 divide-y divide-gray-100"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <MenuItem
              title={"Option 1"}
            />
            <MenuItem title={"Option 2"} subtitle={"This is subtitle for option 2"}  />
            <MenuItem title={"Option 3"} icon={<HiCheck className="text-2xl mx-2" />} subtitle={"This is subtitle with icon for option 3"}  />
          </div>
        </div>
      )}
    </div>
  )
}
