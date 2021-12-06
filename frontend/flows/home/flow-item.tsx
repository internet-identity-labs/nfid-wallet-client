import React from "react"
import clsx from "clsx"

interface FlowSequenceProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title: string
  sequence: string[]
}

export const FlowSequence: React.FC<FlowSequenceProps> = ({
  className,
  title,
  sequence,
}) => {
  return <div className={clsx("", className)}></div>
}
