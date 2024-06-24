import React from "react"

interface NoIconProps extends React.SVGProps<SVGSVGElement> {}

export const NoIcon: React.FC<NoIconProps> = ({ className, onClick }) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <rect width="40" height="40" rx="20" fill="#FAFAFA" />
      <path d="M24 12H12V24" stroke="#E4E4E7" />
      <path d="M12 28H28V12" stroke="#E4E4E7" />
      <path
        d="M8.5 31.5L19.5366 20.4634M31.5 8.5L19.5366 20.4634M28 25L24 21L22 23L19.5366 20.4634"
        stroke="#E4E4E7"
      />
      <path d="M18 19L16 17L12 21" stroke="#E4E4E7" />
    </svg>
  )
}
