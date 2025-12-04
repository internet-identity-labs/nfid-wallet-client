type EthNetworkIconProps = {
  color?: string
  size?: number
}

export const EthNetworkIcon: React.FC<EthNetworkIconProps> = ({
  color = "white",
  size = 18,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#eth_clip)">
        <mask
          id="eth_mask0"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={size}
          height={size}
        >
          <path d="M18 0H0V18H18V0Z" fill="white" />
        </mask>

        <g mask="url(#eth_mask0)">
          <mask
            id="eth_mask1"
            maskUnits="userSpaceOnUse"
            x="4"
            y="2"
            width="10"
            height="15"
          >
            <path
              d="M13.2765 2.04883H4.66406V16.0747H13.2765V2.04883Z"
              fill="white"
            />
          </mask>

          <g mask="url(#eth_mask1)">
            <path
              d="M8.9691 2.04883L8.875 2.36846V11.6426L8.9691 11.7365L13.2739 9.19182L8.9691 2.04883Z"
              fill={color}
            />
            <path
              d="M8.96904 2.04883L4.66406 9.19182L8.96904 11.7365V7.23505V2.04883Z"
              fill="#9CA3AF"
            />
            <path
              d="M8.97098 12.5531L8.91797 12.6178V15.9214L8.97098 16.0761L13.2785 10.0098L8.97098 12.5531Z"
              fill={color}
            />
            <path
              d="M8.96904 16.0761V12.5531L4.66406 10.0098L8.96904 16.0761Z"
              fill="#9CA3AF"
            />
            <path
              d="M8.96875 11.7377L13.2736 9.19309L8.96875 7.23633V11.7377Z"
              fill={color}
            />
            <path
              d="M4.66406 9.19309L8.96904 11.7377V7.23633L4.66406 9.19309Z"
              fill="#9CA3AF"
            />
          </g>
        </g>
      </g>

      <defs>
        <clipPath id="eth_clip">
          <rect width={size} height={size} rx="6" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
