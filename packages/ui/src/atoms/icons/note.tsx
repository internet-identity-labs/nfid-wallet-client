import React from "react"

interface NoteIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NoteIcon: React.FC<NoteIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12C21 9.20435 21 7.80653 20.5433 6.7039C19.9343 5.23373 18.7663 4.06569 17.2961 3.45672C16.1935 3 14.7956 3 12 3C9.20435 3 7.80653 3 6.7039 3.45672C5.23373 4.06569 4.06569 5.23373 3.45672 6.7039C3 7.80653 3 9.20435 3 12V17C3 18.8856 3 19.8284 3.58579 20.4142C4.17157 21 5.11438 21 7 21H12C14.7956 21 16.1935 21 17.2961 20.5433C18.7663 19.9343 19.9343 18.7663 20.5433 17.2961C21 16.1935 21 14.7956 21 12Z"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M16 10L8 10"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 14H8"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
