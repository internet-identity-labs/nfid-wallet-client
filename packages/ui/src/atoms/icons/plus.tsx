import clsx from "clsx"
import React from "react"

interface PlusIconProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

export const PlusIcon: React.FC<PlusIconProps> = ({ className, onClick }) => {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className={clsx("cursor-pointer", className)}
      onClick={onClick}
    >
      <path
        d="M9 3.75V14.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 9H14.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
