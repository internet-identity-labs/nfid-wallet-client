import React from "react"

interface NavOpenCryptopayIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavOpenCryptopayIcon: React.FC<NavOpenCryptopayIconProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" fill="transparent" />
      <path
        d="M5 1.66406L4.90469 1.67768C3.54626 1.87174 2.86704 1.96877 2.41921 2.4166C1.97137 2.86444 1.87434 3.54365 1.68028 4.90208L1.66667 4.9974"
        stroke={strokeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
      />
      <path
        d="M15 1.66406L15.0953 1.67768C16.4537 1.87174 17.133 1.96877 17.5808 2.4166C18.0286 2.86444 18.1257 3.54365 18.3197 4.90208L18.3333 4.9974"
        stroke={strokeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
      />
      <path
        d="M15 18.3359L15.0953 18.3223C16.4537 18.1283 17.133 18.0312 17.5808 17.5834C18.0286 17.1356 18.1257 16.4563 18.3197 15.0979L18.3333 15.0026"
        stroke={strokeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
      />
      <path
        d="M5 18.3359L4.90469 18.3223C3.54626 18.1283 2.86704 18.0312 2.41921 17.5834C1.97137 17.1356 1.87434 16.4563 1.68028 15.0979L1.66667 15.0026"
        stroke={strokeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
      />
      <g clipPath="url(#clip0_93928_131545)">
        <mask
          id="mask0_93928_131545"
          maskUnits="userSpaceOnUse"
          x="3"
          y="4"
          width="14"
          height="12"
        >
          <path d="M16.9881 4H3.01562V16H16.9881V4Z" fill="white" />
        </mask>
        <g mask="url(#mask0_93928_131545)">
          <path
            d="M12.8735 14.7387L16.8634 10.2143C16.9665 10.0975 16.9665 9.90786 16.8634 9.78933L12.094 4.38281L10.3125 6.40285L13.3005 9.79103C13.4035 9.90786 13.4035 10.0975 13.3005 10.216L11.0935 12.7187L12.8749 14.7387H12.8735Z"
            fill={strokeColor}
          />
          <path
            d="M11.7612 16L6.65729 10.2125C6.55426 10.0957 6.55426 9.90602 6.65729 9.7875L11.7612 4H8.30734C8.23716 4 8.16996 4.03217 8.12068 4.08805L3.0929 9.7875C2.98987 9.90433 2.98987 10.094 3.0929 10.2125L8.11919 15.9119C8.16846 15.9678 8.23566 16 8.30584 16H11.7612Z"
            fill={strokeColor}
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_93928_131545">
          <rect
            width="14"
            height="12"
            fill="white"
            transform="translate(3 4)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
