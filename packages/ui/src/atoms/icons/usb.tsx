import clsx from "clsx"
import React from "react"

interface USBIconProps extends React.SVGProps<SVGSVGElement> {}

export const USBIcon: React.FC<USBIconProps> = ({ className, onClick }) => {
  return (
    <svg
      viewBox="0 0 17 24"
      fill="none"
      className={clsx("cursor-pointer w-6 h-6", className)}
      onClick={onClick}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.21218 5.51102C6.01785 5.51102 5.89783 5.29903 5.9978 5.1324L9.00107 0.126953L12.0043 5.1324C12.1043 5.29903 11.9843 5.51102 11.79 5.51102H10V13.8821L13.4104 12.3473C13.7692 12.1858 14 11.8289 14 11.4354V11.0002H13.25C13.1119 11.0002 13 10.8883 13 10.7502V7.25024C13 7.11217 13.1119 7.00024 13.25 7.00024H16.75C16.8881 7.00024 17 7.11217 17 7.25024V10.7502C17 10.8883 16.8881 11.0002 16.75 11.0002H16V11.4354C16 12.6159 15.3077 13.6866 14.2312 14.1711L10 16.0753V17.5716V18.6368C11.0379 19.0389 11.7738 20.0469 11.7738 21.2268C11.7738 22.7603 10.5307 24.0034 8.9972 24.0034C7.46371 24.0034 6.22058 22.7603 6.22058 21.2268C6.22058 20.0448 6.95917 19.0353 8 18.6346V18.2182L3.76881 16.3139C2.69231 15.8295 2 14.7587 2 13.5782V12.6639C1.1674 12.3024 0.585083 11.4728 0.585083 10.5073C0.585083 9.20938 1.63724 8.15723 2.93514 8.15723C4.23304 8.15723 5.2852 9.20938 5.2852 10.5073C5.2852 11.4219 4.76274 12.2144 4 12.6028V13.5782C4 13.9717 4.23077 14.3286 4.5896 14.4901L8 16.025V15.4287V5.51102H6.21218Z"
        fill="#0E62FF"
      />
    </svg>
  )
}
