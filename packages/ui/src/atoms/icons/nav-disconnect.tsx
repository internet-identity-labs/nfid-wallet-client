import React from "react"

interface NavDisconnectIconProps
  extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavDisconnectIcon: React.FC<NavDisconnectIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4974 2.5L9.66406 2.5C7.30704 2.5 6.12853 2.5 5.3963 3.23223C4.66406 3.96447 4.66406 5.14298 4.66406 7.5L4.66406 12.5C4.66406 14.857 4.66406 16.0355 5.3963 16.7678C6.12853 17.5 7.30704 17.5 9.66406 17.5L10.4974 17.5"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
      <path
        d="M13.5234 6.25L17.2734 10M17.2734 10L13.5234 13.75M17.2734 10L9.77344 10"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  )
}
