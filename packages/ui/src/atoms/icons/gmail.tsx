import clsx from "clsx"
import React from "react"

interface GmailIconProps extends React.SVGProps<SVGSVGElement> {}

export const GmailIcon: React.FC<GmailIconProps> = ({ className, onClick }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("cursor-pointer w-6 h-6", className)}
      onClick={onClick}
    >
      <path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        stroke="#0E62FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.39944V12.8994C16 13.6155 16.2951 14.3023 16.8014 14.8086C17.3078 15.315 17.9362 15.5574 18.6523 15.5574C19.3684 15.5574 19.9362 15.1842 20.3118 14.8086C20.6873 14.4331 21 13.6155 21 12.8994V11.9994C20.9999 9.96816 20.3126 7.99667 19.0499 6.40552C17.7873 4.81437 16.0235 3.69714 14.0454 3.23551C12.0673 2.77387 9.99115 2.99498 8.15462 3.86287C6.31809 4.73076 4.82917 6.1944 3.92994 8.01579C3.03071 9.83718 2.77408 11.9092 3.20176 13.8949C3.62944 15.8807 4.71629 17.6633 6.28557 18.9531C7.85486 20.2428 9.81429 20.9637 11.8453 20.9987C13.8762 21.0336 15.8593 20.3804 17.472 19.1454"
        stroke="#0E62FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
