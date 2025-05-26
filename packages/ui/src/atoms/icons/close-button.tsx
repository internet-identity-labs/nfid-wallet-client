import clsx from "clsx"
import React from "react"

type CloseIconProps = React.HTMLAttributes<HTMLDivElement>

export const CloseIcon: React.FC<CloseIconProps> = ({
  className,
  color = "#000",
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
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.162 3.167L17.83 17.833M17.828 3.167L3.161 17.833"
      ></path>
    </svg>
  )
}
