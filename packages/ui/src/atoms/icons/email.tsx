import clsx from "clsx"
import React from "react"

interface EmailIconProps extends React.SVGProps<SVGSVGElement> {}

export const EmailIcon: React.FC<EmailIconProps> = ({
  className,
  color,
  onClick,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-6 h-6", className)}
      onClick={onClick}
    >
      <rect
        id="Rectangle 2"
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      <path
        id="Vector 4"
        d="M2 9L11.1056 13.5528C11.6686 13.8343 12.3314 13.8343 12.8944 13.5528L22 9"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  )
}
