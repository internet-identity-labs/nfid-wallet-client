import React from "react"

interface NavBookIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavAddressBookIcon: React.FC<NavBookIconProps> = ({
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
        d="M16.6693 10L16.6693 14.1667C16.6693 15.738 16.6693 16.5237 16.1811 17.0118C15.693 17.5 14.9073 17.5 13.3359 17.5L5.41927 17.5C4.26868 17.5 3.33594 16.5673 3.33594 15.4167M16.6693 10L16.6693 5.83333C16.6693 4.26199 16.6693 3.47631 16.1811 2.98816C15.693 2.5 14.9073 2.5 13.3359 2.5L6.66927 2.5C5.09792 2.5 4.31225 2.5 3.82409 2.98816C3.33594 3.47631 3.33594 4.26199 3.33594 5.83333L3.33594 15.4167M16.6693 10C16.6693 11.5714 16.6693 12.357 16.1811 12.8452C15.693 13.3333 14.9073 13.3333 13.3359 13.3333L5.41927 13.3333C4.26868 13.3333 3.33594 14.2661 3.33594 15.4167"
        stroke={strokeColor}
        strokeWidth="1.66667"
      />
      <path
        d="M7.5 6.66406L12.5 6.66406"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  )
}
