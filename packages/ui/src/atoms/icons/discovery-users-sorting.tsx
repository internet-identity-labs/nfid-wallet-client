import React from "react"

interface DiscoveryUsersSortingProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const DiscoveryUsersSortingIcon: React.FC<
  DiscoveryUsersSortingProps
> = ({ strokeColor = "black" }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_92973_88448)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.87527 11.25C2.65018 11.25 0.750001 11.6233 0.750001 13.1183C0.750001 14.6133 2.63813 15 4.87527 15C7.10037 15 9 14.6261 9 13.1317C9 11.6373 7.11242 11.25 4.87527 11.25Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.87526 9C6.22143 9 7.3125 7.90842 7.3125 6.56225C7.3125 5.21608 6.22143 4.125 4.87526 4.125C3.5291 4.125 2.43752 5.21608 2.43752 6.56225C2.43297 7.90387 3.51697 8.99545 4.85809 9H4.87526Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.4933 14.4699L13.4933 4.82701"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.293 6.44238L13.4902 3.54101L10.6724 6.43799"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_92973_88448">
          <rect
            width="18"
            height="18"
            fill="white"
            transform="matrix(-4.50541e-08 1 1 4.24087e-08 8.10978e-07 0)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
