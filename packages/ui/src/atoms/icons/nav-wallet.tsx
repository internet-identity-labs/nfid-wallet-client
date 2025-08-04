import React from "react"

interface NavWalletIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavWalletIcon: React.FC<NavWalletIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 4.41667C1.5 2.22899 1.52342 1.5 4.41667 1.5C7.30991 1.5 7.33333 2.22899 7.33333 4.41667C7.33333 6.60434 7.34256 7.33333 4.41667 7.33333C1.49077 7.33333 1.5 6.60434 1.5 4.41667Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6641 4.41667C10.6641 2.22899 10.6875 1.5 13.5807 1.5C16.474 1.5 16.4974 2.22899 16.4974 4.41667C16.4974 6.60434 16.5066 7.33333 13.5807 7.33333C10.6548 7.33333 10.6641 6.60434 10.6641 4.41667Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 13.5807C1.5 11.3931 1.52342 10.6641 4.41667 10.6641C7.30991 10.6641 7.33333 11.3931 7.33333 13.5807C7.33333 15.7684 7.34256 16.4974 4.41667 16.4974C1.49077 16.4974 1.5 15.7684 1.5 13.5807Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6641 13.5807C10.6641 11.3931 10.6875 10.6641 13.5807 10.6641C16.474 10.6641 16.4974 11.3931 16.4974 13.5807C16.4974 15.7684 16.5066 16.4974 13.5807 16.4974C10.6548 16.4974 10.6641 15.7684 10.6641 13.5807Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
