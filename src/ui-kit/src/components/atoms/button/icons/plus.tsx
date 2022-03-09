import React from "react"
import clsx from "clsx"

interface PlusIconProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const PlusIcon: React.FC<PlusIconProps> = ({ children, className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("", className)}
    >
      <path
        d="M9 3.75V14.25"
        stroke="#0E62FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 9H14.25"
        stroke="#0E62FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
