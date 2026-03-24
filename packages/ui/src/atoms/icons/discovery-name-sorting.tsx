import React from "react"

interface DiscoveryNameSortingProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const DiscoveryNameSortingIcon: React.FC<DiscoveryNameSortingProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_92963_121078)">
        <path
          d="M6.86635 10.3623C7.08516 10.1435 7.08516 9.85176 6.93929 9.56C6.86635 9.34119 6.57459 9.19531 6.28284 9.19531H1.17717V10.6541H4.6782L1.32304 14.5198C1.10423 14.7386 1.10423 15.0304 1.25011 15.3221C1.39598 15.6139 1.6148 15.7598 1.90655 15.7598H7.01222V14.301H3.51119L6.86635 10.3623Z"
          fill={strokeColor}
        />
        <path
          d="M4.75225 1.59388C4.67931 1.30213 4.38756 1.15625 4.0958 1.15625C3.80405 1.15625 3.58524 1.30213 3.43936 1.59388L1.25121 6.69955C1.10534 7.06424 1.25121 7.50187 1.6159 7.64775C1.9806 7.79363 2.41823 7.64775 2.5641 7.28306L3.00173 6.26192H5.18988L5.62751 7.28306C5.91926 7.86657 6.50277 7.72069 6.5757 7.64775C6.94039 7.50187 7.08627 7.06424 6.94039 6.69955L4.75225 1.59388ZM3.65817 4.80316L4.0958 3.70909L4.53343 4.80316H3.65817Z"
          fill={strokeColor}
        />
        <path
          d="M13.4933 3.53795L13.4933 13.1808"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.293 11.5654L13.4902 14.4668L10.6724 11.5698"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_92963_121078">
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
