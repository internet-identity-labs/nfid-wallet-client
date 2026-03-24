import React from "react"

interface DiscoveryUsersProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string
}

export const DiscoveryUsersIcon: React.FC<DiscoveryUsersProps> = ({
  strokeColor = "black",
}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10.6504C9.74493 10.6504 11.2714 10.8064 12.3398 11.2158C12.8677 11.4181 13.2435 11.6668 13.4844 11.9512C13.7149 12.2234 13.8496 12.5605 13.8496 13.0107C13.8496 13.4597 13.7143 13.7944 13.4834 14.0645C13.2418 14.3469 12.8646 14.5938 12.335 14.7939C11.2633 15.1989 9.73652 15.3496 8 15.3496C6.25527 15.3496 4.72972 15.1934 3.66113 14.7842C3.13294 14.5819 2.75654 14.3333 2.51562 14.0488C2.2851 13.7766 2.15039 13.4396 2.15039 12.9893C2.1504 12.54 2.28573 12.2056 2.5166 11.9355C2.7582 11.653 3.13526 11.4062 3.66504 11.2061C4.7368 10.8012 6.26345 10.6504 8 10.6504Z"
        stroke={strokeColor}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00037 8.5625C9.93333 8.5625 11.5 6.9951 11.5 5.06214C11.5 3.12918 9.93333 1.5625 8.00037 1.5625C6.06742 1.5625 4.50002 3.12918 4.50002 5.06214C4.49349 6.98857 6.05001 8.55597 7.97571 8.5625H8.00037Z"
        stroke={strokeColor}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
