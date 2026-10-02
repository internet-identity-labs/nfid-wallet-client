import React from "react"

interface IconSwitchProps extends React.HTMLAttributes<HTMLDivElement> {}

export const IconSwitch: React.FC<IconSwitchProps> = ({ className }) => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.66537 12.1668L3.33203 15.5002M3.33203 15.5002L6.66536 18.8335M3.33203 15.5002L12.4987 15.5002C14.3396 15.5002 15.832 14.0078 15.832 12.1668L15.832 11.3335"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
      <path
        d="M13.3346 8.83317L16.668 5.49984M16.668 5.49984L13.3346 2.1665M16.668 5.49984L7.5013 5.49984C5.66035 5.49984 4.16797 6.99222 4.16797 8.83317L4.16797 9.6665"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  )
}
