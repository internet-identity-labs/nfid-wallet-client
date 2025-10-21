import React from "react"

interface NavVaultsIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavVaultsIcon: React.FC<NavVaultsIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5952 2.29688C14.5952 2.29688 6.53104 2.30021 6.52104 2.30021C4.22104 2.31438 2.79688 3.82771 2.79688 6.13604V8.05187V9.96771V13.7994C2.79688 16.1194 4.23188 17.6385 6.55187 17.6385C6.55187 17.6385 14.6152 17.636 14.626 17.636C16.926 17.6219 18.351 16.1077 18.351 13.7994V6.13604C18.351 3.81604 16.9152 2.29688 14.5952 2.29688Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10.5625"
        cy="9.96094"
        r="2.5"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.77402 8.16465L6.39841 5.78909"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.7339 14.1253L12.5 11.8906"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5407 7.9827L14.7344 5.78906"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.40487 14.1263L8.57031 11.9609"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
