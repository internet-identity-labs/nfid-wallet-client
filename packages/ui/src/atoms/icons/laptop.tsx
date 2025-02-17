import clsx from "clsx"
import React from "react"

interface LaptopIconProps extends React.SVGProps<SVGSVGElement> {}

export const IconDesktop: React.FC<LaptopIconProps> = ({
  className,
  onClick,
}) => {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      className={clsx("w-6 h-6 cursor-pointer", className)}
      onClick={onClick}
    >
      <path
        fill="#0E62FF"
        d="M17 31.168a1.417 1.417 0 01-1.417-1.417v-4.25h-8.5a4.255 4.255 0 01-4.25-4.25V7.084a4.255 4.255 0 014.25-4.25h19.833a4.255 4.255 0 014.25 4.25v14.167a4.255 4.255 0 01-4.25 4.25H15.583a1.416 1.416 0 110-2.833h11.333a1.418 1.418 0 001.417-1.417V7.084a1.418 1.418 0 00-1.417-1.416H7.083a1.418 1.418 0 00-1.417 1.416v14.167a1.418 1.418 0 001.417 1.417H17a1.417 1.417 0 011.416 1.416v5.667A1.417 1.417 0 0117 31.168z"
      />
      <path
        fill="#0E62FF"
        d="M21.25 31.166h-8.5a1.417 1.417 0 110-2.833h8.5a1.417 1.417 0 010 2.833zM17 21.249a1.404 1.404 0 01-1.417-1.417 1.417 1.417 0 112.833 0A1.404 1.404 0 0117 21.249z"
      />
    </svg>
  )
}
