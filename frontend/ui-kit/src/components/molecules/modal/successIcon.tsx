import React from "react"
import clsx from "clsx"

interface ModalSuccessIconProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const ModalSuccessIcon: React.FC<ModalSuccessIconProps> = ({
  children,
  className,
}) => {
  return (
    <svg
      width="235"
      height="235"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("", className)}
    >
      <g opacity="0.7" filter="url(#filter0_f_1055_1100)">
        <circle
          cx="163.622"
          cy="99.6216"
          r="64.5318"
          transform="rotate(-81.2244 163.622 99.6216)"
          fill="url(#paint0_radial_1055_1100)"
        />
      </g>
      <g filter="url(#filter1_f_1055_1100)">
        <ellipse
          cx="117"
          cy="135.5"
          rx="82"
          ry="81.5"
          fill="url(#paint1_radial_1055_1100)"
        />
      </g>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M118.807 191C72.1486 191 62.8066 181.679 62.8066 135C62.8066 88.3349 72.1486 79.0005 118.807 79.0005C165.458 79.0005 174.807 88.3349 174.807 135C174.807 181.679 165.458 191 118.807 191Z"
        fill="white"
        fill-opacity="0.55"
      />
      <path
        d="M63.3066 135C63.3066 146.66 63.8907 155.952 65.4841 163.338C67.0763 170.717 69.6693 176.159 73.6634 180.151C77.6575 184.144 83.0996 186.735 90.4782 188.326C97.8624 189.918 107.152 190.5 118.807 190.5C130.46 190.5 139.748 189.918 147.132 188.326C154.511 186.735 159.953 184.144 163.947 180.151C167.942 176.158 170.535 170.717 172.128 163.338C173.722 155.952 174.307 146.66 174.307 135C174.307 123.344 173.722 114.053 172.128 106.669C170.535 99.29 167.942 93.8481 163.947 89.8545C159.953 85.8608 154.51 83.2685 147.132 81.6769C139.748 80.0841 130.46 79.5005 118.807 79.5005C107.152 79.5005 97.8625 80.0841 90.4783 81.6769C83.0997 83.2685 77.6576 85.8608 73.6634 89.8544C69.6693 93.8481 67.0763 99.29 65.4841 106.669C63.8907 114.053 63.3066 123.344 63.3066 135Z"
        stroke="url(#paint2_linear_1055_1100)"
        stroke-opacity="0.24"
      />
      <path
        d="M114.045 152C112.732 152 111.419 151.516 110.416 150.542L96.5047 137.027C94.4997 135.079 94.4997 131.924 96.5047 129.982C98.5097 128.034 101.752 128.028 103.757 129.976L114.045 139.971L138.245 116.461C140.25 114.513 143.492 114.513 145.497 116.461C147.502 118.409 147.502 121.564 145.497 123.512L117.674 150.542C116.672 151.516 115.358 152 114.045 152Z"
        fill="#13D377"
      />
      <defs>
        <filter
          id="filter0_f_1055_1100"
          x="64.0811"
          y="0.0806885"
          width="199.082"
          height="199.082"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="17.5"
            result="effect1_foregroundBlur_1055_1100"
          />
        </filter>
        <filter
          id="filter1_f_1055_1100"
          x="0"
          y="19"
          width="234"
          height="233"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="17.5"
            result="effect1_foregroundBlur_1055_1100"
          />
        </filter>
        <radialGradient
          id="paint0_radial_1055_1100"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(163.622 99.6216) rotate(90) scale(64.5318)"
        >
          <stop stop-color="#B1FF62" />
          <stop offset="1" stop-color="#FFF73A" stop-opacity="0" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_1055_1100"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(117 135.5) rotate(90) scale(81.5 82)"
        >
          <stop stop-color="#1AFF68" />
          <stop offset="1" stop-color="#1AFF68" stop-opacity="0.13" />
        </radialGradient>
        <linearGradient
          id="paint2_linear_1055_1100"
          x1="119.002"
          y1="191"
          x2="119.002"
          y2="79"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
