import React from "react"

interface NavDiscoveryIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavDiscoveryIcon: React.FC<NavDiscoveryIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 5.41667C2.5 3.22899 2.52342 2.5 5.41667 2.5C8.30991 2.5 8.33333 3.22899 8.33333 5.41667C8.33333 7.60434 8.34256 8.33333 5.41667 8.33333C2.49077 8.33333 2.5 7.60434 2.5 5.41667Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6641 5.41667C11.6641 3.22899 11.6875 2.5 14.5807 2.5C17.474 2.5 17.4974 3.22899 17.4974 5.41667C17.4974 7.60434 17.5066 8.33333 14.5807 8.33333C11.6548 8.33333 11.6641 7.60434 11.6641 5.41667Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 14.5807C2.5 12.3931 2.52342 11.6641 5.41667 11.6641C8.30991 11.6641 8.33333 12.3931 8.33333 14.5807C8.33333 16.7684 8.34256 17.4974 5.41667 17.4974C2.49077 17.4974 2.5 16.7684 2.5 14.5807Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6641 14.5807C11.6641 12.3931 11.6875 11.6641 14.5807 11.6641C17.474 11.6641 17.4974 12.3931 17.4974 14.5807C17.4974 16.7684 17.5066 17.4974 14.5807 17.4974C11.6548 17.4974 11.6641 16.7684 11.6641 14.5807Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
