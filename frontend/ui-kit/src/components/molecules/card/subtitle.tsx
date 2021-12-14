import React from "react"
import clsx from "clsx"
import { H5 } from "../../atoms/typography"

interface CardSubtitleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CardSubtitle: React.FC<CardSubtitleProps> = ({
  children,
  className,
}) => {
  return (
    <H5 className="leading-5 text-center font-medium text-gray-600 mb-8">
      {children}
    </H5>
  )
}
