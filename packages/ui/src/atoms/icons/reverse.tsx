import React from "react"

interface IconReverseProps extends React.HTMLAttributes<HTMLDivElement> {}

export const IconReverse: React.FC<IconReverseProps> = ({ className }) => {
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
        d="M9.90036 21L6 17L9.90036 13M6 17L18 16.9988"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1 3L18 7L14.1 11M18 7L6 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
