import React from "react"

interface MapPinIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
  size?: string | number
}

export const IconCheckMark: React.FC<MapPinIconProps> = ({ onClick }) => {
  return (
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.666 7 9.5 16.167 5.333 12"
        stroke="#0E62FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
