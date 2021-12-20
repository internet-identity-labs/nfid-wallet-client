import React from "react"
import clsx from "clsx"
import { HiTrash } from "react-icons/hi"

interface DeleteButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  disabled?: boolean
  onClick?: () => void
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  children,
  className,
  disabled = false,
  onClick,
}) => {
  return disabled ? (
    <div className="p-1 rounded-full text-gray-300 pointer-events-none">
      <HiTrash className="text-xl" />
    </div>
  ) : (
    <div
      className="p-1 hover:bg-red-50 rounded-full text-gray-500 hover:text-red-500 w-min"
      onClick={onClick}
    >
      <HiTrash className="text-xl" />
    </div>
  )
}
