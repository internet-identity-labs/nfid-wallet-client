import React from "react"
import clsx from "clsx"

interface CopyLinkToChannelProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CopyLinkToChannel: React.FC<CopyLinkToChannelProps> = ({
  className,
}) => {
  return <div className={clsx("", className)}>CopyLinkToChannel</div>
}
