import React from "react"
import clsx from "clsx"

interface ModalCloseIconProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const ModalCloseIcon: React.FC<ModalCloseIconProps> = ({
  children,
  className,
}) => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("hover:cursor-pointer", className)}
    >
      <path
        d="M3.66699 4.16663L12.3337 12.8333"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.333 4.16663L3.66634 12.8333"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
