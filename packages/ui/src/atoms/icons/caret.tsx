import clsx from "clsx"
import React from "react"

interface MapPinIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  color?: string
}

export const IconCaret: React.FC<MapPinIconProps> = ({ color = "black" }) => {
  return (
    <div className="relative">
      <div
        className={clsx(
          "absolute w-0 h-0.5 top-0 bottom-0 right-[1px] my-auto",
          "group-hover:w-3 transition-all duration-300",
        )}
        style={{ backgroundColor: color }}
      ></div>
      <svg
        className="transition-transform group-hover:translate-x-[2px] duration-300"
        width="7"
        height="12"
        viewBox="0 0 7 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L6 6L1 11"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
