import clsx from "clsx"
import React from "react"

type CopyIconProps = React.HTMLAttributes<HTMLDivElement>

export const CopyAddressIcon: React.FC<CopyIconProps> = ({ className }) => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(className)}
    >
      <path
        d="M10.2795 4.55729V4.55729C10.2795 3.93731 10.2795 3.62732 10.2114 3.37299C10.0264 2.6828 9.48734 2.14371 8.79715 1.95877C8.54282 1.89062 8.23283 1.89062 7.61285 1.89062H5.39063C3.50501 1.89062 2.5622 1.89062 1.97641 2.47641C1.39062 3.0622 1.39062 4.00501 1.39062 5.89063V8.11285C1.39062 8.73283 1.39062 9.04282 1.45877 9.29715C1.64371 9.98734 2.1828 10.5264 2.87299 10.7114C3.12732 10.7795 3.43731 10.7795 4.05729 10.7795V10.7795"
        stroke="currentColor"
      />
      <rect
        x="5.71875"
        y="6.21875"
        width="8.88889"
        height="8.88889"
        rx="2"
        stroke="currentColor"
      />
    </svg>
  )
}
