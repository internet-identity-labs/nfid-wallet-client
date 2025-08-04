import React from "react"

interface NavSecurityIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const NavSecurityIcon: React.FC<NavSecurityIconProps> = ({
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99235 18.0102C9.99235 18.0102 16.3857 16.0744 16.3857 10.7377C16.3857 5.40021 16.6173 4.98354 16.1048 4.47021C15.5915 3.95687 10.8307 2.29688 9.99235 2.29688C9.15401 2.29688 4.39318 3.95687 3.88068 4.47021C3.36735 4.98354 3.59901 5.40021 3.59901 10.7377C3.59901 16.0744 9.99235 18.0102 9.99235 18.0102Z"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.82812 9.8974L9.40479 11.4766L12.6531 8.22656"
        stroke={strokeColor}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
