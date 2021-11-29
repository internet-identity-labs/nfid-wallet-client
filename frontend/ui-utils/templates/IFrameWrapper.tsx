import React from "react"
import clsx from "clsx"

interface IFrameWrapperProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameWrapper: React.FC<IFrameWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("", className)}>
      {/* TODO: implement IFrame wrapper */}
    </div>
  )
}
