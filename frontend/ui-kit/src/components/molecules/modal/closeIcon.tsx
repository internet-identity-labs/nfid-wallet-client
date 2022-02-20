import React from "react"
import clsx from "clsx"

interface ModalCloseIconProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const ModalCloseIcon: React.FC<ModalCloseIconProps> = ({
  children,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      fill="currentColor"
      viewBox="0 0 21 21"
      className={clsx("hover:cursor-pointer", className)}
    >
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.162 3.167L17.83 17.833M17.828 3.167L3.161 17.833"
      ></path>
    </svg>
  )
}
