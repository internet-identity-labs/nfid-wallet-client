import clsx from "clsx"
import React from "react"

interface MobileIconProps extends React.SVGProps<SVGSVGElement> {}

export const MobileIcon: React.FC<MobileIconProps> = ({
  className,
  onClick,
}) => {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      className={clsx("cursor-pointer w-6 h-6", className)}
      onClick={onClick}
    >
      <path
        d="M8.49902 7.08333C8.49902 5.51853 9.76755 4.25 11.3324 4.25H22.6657C24.2305 4.25 25.499 5.51853 25.499 7.08333V26.9167C25.499 28.4815 24.2305 29.75 22.6657 29.75H11.3324C9.76755 29.75 8.49902 28.4815 8.49902 26.9167V7.08333ZM22.6657 7.08333H11.3324V26.9167H22.6657V7.08333Z"
        fill="#0E62FF"
      />
      <path
        d="M14.167 7.08325H19.8337V7.08325C19.8337 7.86566 19.1994 8.49992 18.417 8.49992H15.5837C14.8013 8.49992 14.167 7.86566 14.167 7.08325V7.08325Z"
        fill="#0E62FF"
      />
    </svg>
  )
}
