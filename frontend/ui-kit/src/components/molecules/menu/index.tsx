import clsx from "clsx"
import React, { useState } from "react"
import { HiChevronDown } from "react-icons/hi"
interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  children: (toggle: () => void) => React.ReactNode
}

export const DropdownMenu: React.FC<Props> = ({
  children,
  title = "Choose an option",
  className,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDialog(false)
      }
    }
    document.addEventListener("click", handleClickOutside, true)
    return () => {
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [])

  return (
    <div className={clsx("relative inline-block w-full", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setShowDialog(!showDialog)}
        className="border border-black-base bg-white flex justify-between items-center w-full rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {title}
        <HiChevronDown className="ml-3 text-lg" />
      </button>

      {showDialog && (
        <div
          className={clsx(
            "origin-top-right rounded-md shadow-lg bg-white z-50 absolute w-full",
          )}
        >
          <div className="py-1">{children(() => setShowDialog(false))}</div>
        </div>
      )}
    </div>
  )
}
