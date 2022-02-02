import clsx from "clsx"
import { H5 } from "components/atoms/typography/index"
import React from "react"

interface IFrameHeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  onClick: () => void
}

export const IFrameHeader: React.FC<IFrameHeaderProps> = ({
  children,
  className,
  title,
  onClick,
}) => {
  return (
    <div className="bg-white px-3 py-4 rounded-t-xl text-black w-full">
      {title && <H5 className="text-center">{title}</H5>}
    </div>
  )
}
