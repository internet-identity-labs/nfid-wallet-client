import React from "react"

interface IconApproveProps extends React.HTMLAttributes<HTMLDivElement> {}

export const IconApprove: React.FC<IconApproveProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18.6693 7L9.5026 16.1667L5.33594 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
