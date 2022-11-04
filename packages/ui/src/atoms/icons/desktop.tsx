import clsx from "clsx"
import React from "react"

interface DesktopIconProps extends React.SVGProps<SVGSVGElement> {}

export const IconLaptop: React.FC<DesktopIconProps> = ({
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
        d="M28.3333 22.666C28.1473 22.6661 27.963 22.6295 27.7911 22.5583C27.6192 22.4871 27.463 22.3827 27.3315 22.2512C27.1999 22.1196 27.0956 21.9634 27.0244 21.7915C26.9532 21.6196 26.9166 21.4354 26.9167 21.2493L26.9167 8.49935L7.08333 8.49935L7.08333 21.2493C7.08333 21.6251 6.93408 21.9854 6.6684 22.2511C6.40272 22.5168 6.04239 22.666 5.66667 22.666C5.29094 22.666 4.93061 22.5168 4.66493 22.2511C4.39926 21.9854 4.25 21.6251 4.25 21.2493L4.25 8.49935C4.25086 7.74817 4.54965 7.02799 5.08081 6.49683C5.61198 5.96566 6.33215 5.66687 7.08333 5.66602L26.9167 5.66602C27.6678 5.66687 28.388 5.96566 28.9192 6.49683C29.4504 7.02799 29.7491 7.74817 29.75 8.49935L29.75 21.2493C29.75 21.4354 29.7134 21.6196 29.6423 21.7915C29.5711 21.9634 29.4667 22.1196 29.3352 22.2512C29.2036 22.3827 29.0474 22.4871 28.8755 22.5583C28.7036 22.6295 28.5194 22.6661 28.3333 22.666Z"
        fill="#0E62FF"
      />
      <path
        d="M31.167 28.3321L2.83366 28.3321C2.45794 28.3321 2.0976 28.1829 1.83192 27.9172C1.56625 27.6515 1.41699 27.2912 1.41699 26.9154C1.41699 26.5397 1.56625 26.1794 1.83192 25.9137C2.0976 25.648 2.45794 25.4988 2.83366 25.4988L31.167 25.4988C31.5427 25.4988 31.9031 25.648 32.1687 25.9137C32.4344 26.1794 32.5837 26.5397 32.5837 26.9154C32.5837 27.2912 32.4344 27.6515 32.1687 27.9172C31.9031 28.1829 31.5427 28.3321 31.167 28.3321Z"
        fill="#0E62FF"
      />
    </svg>
  )
}
