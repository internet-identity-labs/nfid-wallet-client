import clsx from "clsx"
import React from "react"

interface TrashIconProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

export const TrashIcon: React.FC<TrashIconProps> = ({ className, onClick }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={clsx(
        "text-secondary hover:text-red-base cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <path
        fill="currentColor"
        fillOpacity="1"
        fillRule="evenodd"
        d="M10.285 6.129A.395.395 0 0110.571 6h2.858c.097 0 .201.04.286.129a.54.54 0 01.142.371V7h-3.714v-.5a.54.54 0 01.142-.371zM8.143 7v-.5c0-.648.244-1.278.694-1.75A2.395 2.395 0 0110.571 4h2.858c.66 0 1.283.276 1.734.75a2.54 2.54 0 01.694 1.75V7H19a1 1 0 110 2h-1v9.5c0 .648-.245 1.278-.694 1.75a2.395 2.395 0 01-1.735.75H8.43c-.66 0-1.283-.276-1.735-.75A2.539 2.539 0 016 18.5V9H5a1 1 0 010-2h3.143zM8 9v9.5c0 .148.056.28.143.371a.395.395 0 00.286.129h7.142c.098 0 .202-.04.286-.129A.539.539 0 0016 18.5V9H8zm2.5 1.5a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 1a1 1 0 10-2 0v5a1 1 0 102 0v-5z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}
