import React from "react"
import clsx from "clsx"

interface AwaitingConfirmationProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AwaitingConfirmation: React.FC<AwaitingConfirmationProps> = ({
  className,
}) => {
  return <div className={clsx("", className)}>AwaitingConfirmation</div>
}
