import React from "react"

interface MapPinIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
  size?: string | number
}

export const IconCancel: React.FC<MapPinIconProps> = ({ onClick }) => {
  return (
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.304 6.697 6.697 17.304M6.696 6.697l10.607 10.607"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
